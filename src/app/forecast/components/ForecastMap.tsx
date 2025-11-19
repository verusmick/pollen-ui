'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';

import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { TileLayer } from '@deck.gl/geo-layers';
import {
  GeoJsonLayer,
  PolygonLayer,
  BitmapLayer,
  IconLayer,
} from '@deck.gl/layers';

import type { Feature, FeatureCollection } from 'geojson';

import bavariaGeo from '@/data/bavaria.geo.json';
import germanyGeo from '@/data/germany.geo.json';

import {
  useCoordinatesStore,
  useCurrentLocationStore,
  usePartialLoadingStore,
  usePollenDetailsChartStore,
  useSearchLocationStore,
} from '@/app/forecast/stores';

import { MapTooltip } from '@/app/forecast/components';

import filterPointsInRegion from '@/utils/filterPointsInRegion';
import { getBoundsFromViewState, useDebounce } from '@/utils';
import {
  fetchAndShowPollenChart,
  findClosestCoordinate,
  getInitialViewState,
  getRegionGeo,
} from '@/app/forecast/utils';
import { MapZoomControls } from '@/app/components';

// Define the grid cell size in degrees
const GRID_RESOLUTION = 0.02; // Adjust this for larger/smaller quadrants

export default function ForecastMap({
  pollenData,
  onRegionChange,
  pollenSelected,
  currentDate,
}: {
  pollenData: any;
  pollenSelected: string;
  currentDate: string;

  onRegionChange: (box: number[]) => void;
}) {
  const [viewMapState, setViewMapState] = useState(getInitialViewState);
  const { setChartLoading } = usePartialLoadingStore();
  const [tooltipInfo, setTooltipInfo] = useState<{
    object: any;
    x: number;
    y: number;
  } | null>(null);
  const [bounds, setBounds] = useState<number[] | null>(null);
  const { lat: searchLat, lng: searchlong, name } = useSearchLocationStore();
  const {
    lat: currentLocationLat,
    lng: currentLocationLong,
    clearLocation: clearCurrentLocation,
    setLocation: setCurrentLocation,
  } = useCurrentLocationStore((state) => state);
  const {
    setShow: setShowPollenDetailsChart,
    latitude: pollenDetailsChartLatitude,
    longitude: pollenDetailsChartLongitude,
  } = usePollenDetailsChartStore();
  const lastRequestId = useRef<string | null>(null);
  const debouncedBounds = useDebounce(bounds, 300);

  const handleGridCellClick = useCallback(
    async (clickLat: number, clickLon: number) => {
      setChartLoading(true);
      const requestId = `${clickLat}-${clickLon}-${Date.now()}`;
      lastRequestId.current = requestId;

      const { latitudes, longitudes } = useCoordinatesStore.getState();
      const closestLat = findClosestCoordinate(clickLat, latitudes);
      const closestLon = findClosestCoordinate(clickLon, longitudes);

      try {
        setShowPollenDetailsChart(true, '', null, closestLat, closestLon);
        await fetchAndShowPollenChart({
          lat: closestLat,
          lng: closestLon,
          pollen: pollenSelected,
          date: currentDate,
          setShowPollenDetailsChart,
          requestId,
        });
      } catch (error) {
        console.error('Error clicking on the map', error);
      } finally {
        if (lastRequestId.current === requestId) {
          setChartLoading(false);
        }
      }
    },
    [setChartLoading, setShowPollenDetailsChart, pollenSelected, currentDate]
  );

  // Convert your API data to grid cells
  const gridCells = useMemo(() => {
    if (!pollenData || pollenData.length === 0) return [];
    const filteredPoints = filterPointsInRegion(pollenData, getRegionGeo());
    // const filteredPoints = pollenData;
    // Create grid cells from filtered points
    return filteredPoints.map(([lat, lon, intensity = 0.5]) => {
      // Create a square quadrant around each point
      const halfCell = GRID_RESOLUTION / 2;

      const quadrant = [
        [lon - halfCell, lat - halfCell], // bottom-left
        [lon + halfCell, lat - halfCell], // bottom-right
        [lon + halfCell, lat + halfCell], // top-right
        [lon - halfCell, lat + halfCell], // top-left
        [lon - halfCell, lat - halfCell], // close polygon
      ];

      return {
        polygon: quadrant,
        intensity: intensity,
        position: [lon, lat],
      };
    });
  }, [pollenData]);

  const pollenGridCellsLayer = new PolygonLayer({
    id: 'pollen-grid',
    data: gridCells,
    getPolygon: (d: any) => d.polygon,
    getFillColor: (d: any) => {
      const intensity = d.intensity;
      // Your color scale based on pollen intensity
      if (intensity <= 0.2) return [0, 100, 0, 60]; // Dark Green - low
      else if (intensity <= 0.4) return [154, 205, 50, 60]; // Yellow Green
      else if (intensity <= 0.6) return [255, 255, 0, 60]; // Yellow
      else if (intensity <= 0.8) return [255, 165, 0, 60]; // Orange
      else return [255, 0, 0, 60]; // Red - high
    },
    getLineColor: [0, 0, 0, 10],
    // lineWidthMinPixels: 0.5,
    filled: true,
    stroked: true,
    extruded: false,
    // 🔥 HOVER CONFIGURATION
    pickable: true,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 100], // White highlight border
    onHover: (info: any) => {
      // Show tooltip on hover
      // if (info.object) {
      //   setTooltipInfo({
      //     object: info.object,
      //     x: info.x,
      //     y: info.y,
      //   });
      // } else {
      //   setTooltipInfo(null); // Hide tooltip when not hovering
      // }
    },
    onClick: (info: any) => {
      if (!info.object) return;
      handleGridCellClick(info.coordinate[1], info.coordinate[0]);
    },
  });

  const pinIconLayer =
    pollenDetailsChartLatitude && pollenDetailsChartLongitude
      ? new IconLayer({
          id: 'search-marker',
          data: [
            {
              position: [
                pollenDetailsChartLongitude,
                pollenDetailsChartLatitude,
              ],
              name,
            },
          ],
          getIcon: () => 'marker',
          getColor: () => [33, 33, 33],
          getPosition: (d) => d.position,
          getSize: () => 41,
          iconAtlas: '/map_icon.png',
          iconMapping: {
            marker: {
              x: 0,
              y: 0,
              width: 128,
              height: 128,
              anchorY: 128,
              mask: true,
            },
          },
          pickable: true,
        })
      : null;

  // Free OpenStreetMap base layer
  const baseMapLayer = new TileLayer({
    id: 'base-map',
    data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    renderSubLayers: (props) => {
      const { bbox, data, id } = props.tile;

      // Handle different types of bounding boxes
      const bounds: [number, number, number, number] =
        'west' in bbox
          ? [bbox.west, bbox.south, bbox.east, bbox.north]
          : [bbox.left, bbox.bottom, bbox.right, bbox.top];

      return new BitmapLayer({
        id: `${id}-bitmap`,
        image: data,
        bounds,
      });
    },
  });

  // Bavaria boundary
  const bavariaGeoJsonLayer = () => {
    const region = process.env.NEXT_PUBLIC_REGION?.toUpperCase() || 'BAVARIA';
    if (region !== 'BAVARIA') return null;
    return new GeoJsonLayer({
      id: 'bavaria-boundary',
      data: bavariaGeo as FeatureCollection,
      filled: false,
      stroked: true,
      getLineColor: [78, 77, 77],
      lineWidthMinPixels: 1.5,
      getLineWidth: 1,
    });
  };

  // Create mask for area outside Germany
  const germanyGeoJsonLayer = useMemo(() => {
    const bavariaCoords = germanyGeo.features[0].geometry.coordinates;

    const maskPolygon: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          // World bounds
          [
            [-180, -90],
            [-180, 90],
            [180, 90],
            [180, -90],
            [-180, -90],
          ],
          // Bavaria hole
          ...bavariaCoords.flat(),
        ],
      },
    };

    return new GeoJsonLayer({
      id: 'mask-layer',
      data: [maskPolygon],
      filled: true,
      stroked: false,
      getFillColor: [33, 33, 33, 180], // Dark gray
    });
  }, []);

  const handleViewStateChange = (e: any) => {
    const nextViewState = e.viewState;
    setViewMapState(nextViewState);
    const nextBounds = getBoundsFromViewState(nextViewState);
    setBounds(nextBounds);
  };

  const handleCursor = ({ isDragging, isHovering }: any) => {
    if (isDragging) return 'grabbing';
    if (isHovering) return 'pointer';
    return 'grab';
  };
  const openChartAtLocation = (lat: number, lng: number) => {
    clearCurrentLocation();
    setViewMapState((prev) => ({
      ...prev,
      longitude: lng,
      latitude: lat,
      zoom: 10,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator(),
    }));
    setShowPollenDetailsChart(true, '', null, lat, lng);
  };
  useEffect(() => {
    if (debouncedBounds && onRegionChange) {
      onRegionChange(debouncedBounds);
    }
  }, [debouncedBounds, onRegionChange]);

  // watcher to check the properties of the map
  useEffect(() => {
    if (searchLat && searchlong) {
      openChartAtLocation(searchLat, searchlong);
    }
  }, [searchLat, searchlong]);

  useEffect(() => {
    if (currentLocationLat && currentLocationLong) {
      openChartAtLocation(currentLocationLat, currentLocationLong);
    }
  }, [currentLocationLat, currentLocationLong]);

  return (
    <>
      <DeckGL
        initialViewState={viewMapState}
        controller={true}
        layers={[
          baseMapLayer,
          bavariaGeoJsonLayer(),
          germanyGeoJsonLayer,
          pollenGridCellsLayer,
          pinIconLayer,
        ]}
        style={{ width: '100vw', height: '100vh', cursor: 'pointer' }}
        viewState={viewMapState}
        // This is triggered when the hand move the map
        onViewStateChange={handleViewStateChange}
        getCursor={handleCursor}
      />
      <MapTooltip hoverInfo={tooltipInfo} />
      <MapZoomControls
        zoom={viewMapState.zoom}
        minZoom={viewMapState.minZoom}
        maxZoom={viewMapState.maxZoom}
        onZoomChange={(newZoom) =>
          setViewMapState((prev) => ({ ...prev, zoom: newZoom }))
        }
      />
    </>
  );
}
