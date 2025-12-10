'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import {
  GeoJsonLayer,
  PolygonLayer,
  BitmapLayer,
  IconLayer,
} from '@deck.gl/layers';
import type { Feature, FeatureCollection } from 'geojson';

import { MapZoomControls } from '@/app/components';
import { useCurrentLocationStore, usePartialLoadingStore } from '@/app/stores';
import { getInitialViewState } from '@/app/now-casting/utils';
import { getRegionGeo } from '@/app/utils/maps';
import filterPointsInRegion from '@/utils/deck/filterPointsInRegion';
import bavariaGeo from '@/data/bavaria.geo.json';
import { usePollenChart } from '@/app/hooks';
import { usePollenDetailsChartStore } from '@/app/forecast/stores';

interface NowCastingMapProps {
  pollenData: any;
  gridCellsResolution: number;
  userLocation: { lat: number; lng: number } | null;
  pollenSelected: string;
  currentDate: string;
}

export default function NowCastingMap({
  pollenData,
  gridCellsResolution,
  userLocation,
  pollenSelected,
  currentDate,
}: NowCastingMapProps) {
  const [viewMapState, setViewMapState] = useState(getInitialViewState);
  const { setChartLoading } = usePartialLoadingStore();
  const { fetchChart } = usePollenChart();
  const {
    setShow: setShowPollenDetailsChart,
    latitude: pollenDetailsChartLatitude,
    longitude: pollenDetailsChartLongitude,
  } = usePollenDetailsChartStore();

  const {
    lat: currentLocationLat,
    lng: currentLocationLng,
    clearLocation,
  } = useCurrentLocationStore();

  // -----------------------------
  // HANDLE GRID CELL CLICK
  // -----------------------------
  const handleGridCellClick = useCallback(
    async (clickLat: number, clickLon: number) => {
      setShowPollenDetailsChart(true, '', null, clickLat, clickLon);
      setChartLoading(true);
      try {
        await fetchChart({
          lat: clickLat,
          lng: clickLon,
          pollen: pollenSelected,
          date: currentDate,
          nowcasting: { hour: 21, nhours: 48 },
        });
      } catch (err) {
        console.error('NowCastingMap handleGridCellClick error:', err);
      } finally {
        setChartLoading(false);
      }
    },
    [
      fetchChart,
      setChartLoading,
      pollenSelected,
      currentDate,
      setShowPollenDetailsChart,
    ]
  );

  // -----------------------------
  // GRID CELLS
  // -----------------------------
  const gridCells = useMemo(() => {
    if (!pollenData || pollenData.length === 0) return [];

    const filteredPoints = filterPointsInRegion(pollenData, getRegionGeo());

    return filteredPoints.map(([lat, lon, intensityRaw]) => {
      const intensity = typeof intensityRaw === 'number' ? intensityRaw : 0;
      const halfCell = gridCellsResolution / 2; // usa resolución dinámica
      const quadrant = [
        [lon - halfCell, lat - halfCell],
        [lon + halfCell, lat - halfCell],
        [lon + halfCell, lat + halfCell],
        [lon - halfCell, lat + halfCell],
        [lon - halfCell, lat - halfCell],
      ];
      return { polygon: quadrant, intensity, position: [lon, lat] };
    });
  }, [pollenData, gridCellsResolution]);

  // -----------------------------
  // POLLEN GRID LAYER
  // -----------------------------
  const pollenGridCellsLayer = useMemo(
    () =>
      new PolygonLayer({
        id: 'pollen-grid',
        data: gridCells,
        getPolygon: (d: any) => d.polygon,
        getFillColor: (d: any) => {
          const intensity = d.intensity;
          if (intensity === null) return [0, 0, 0, 0];
          switch (intensity) {
            case 2:
              return [0, 100, 0, 60];
            case 4:
              return [154, 205, 50, 60];
            case 6:
              return [255, 255, 0, 60];
            case 8:
              return [255, 165, 0, 60];
            case 9:
              return [255, 0, 0, 60];
            default:
              return [0, 0, 0, 0];
          }
        },
        getLineColor: [0, 0, 0, 10],
        filled: true,
        stroked: true,
        extruded: false,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 100],
        onClick: (info: any) => {
          if (!info.object) return;
          handleGridCellClick(info.coordinate[1], info.coordinate[0]);
        },
      }),
    [gridCells, handleGridCellClick]
  );

  // -----------------------------
  // PIN ICON LAYER
  // -----------------------------
  const pinIconLayer = useMemo(() => {
    if (!pollenDetailsChartLatitude || !pollenDetailsChartLongitude)
      return null;

    return new IconLayer({
      id: 'search-marker',
      data: [
        { position: [pollenDetailsChartLongitude, pollenDetailsChartLatitude] },
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
    });
  }, [pollenDetailsChartLatitude, pollenDetailsChartLongitude]);

  // -----------------------------
  // BASE MAP
  // -----------------------------
  const baseMapLayer = useMemo(
    () =>
      new TileLayer({
        id: 'base-map',
        data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,
        renderSubLayers: (props) => {
          const { bbox, data, id } = props.tile;
          const bounds: [number, number, number, number] =
            'west' in bbox
              ? [bbox.west, bbox.south, bbox.east, bbox.north]
              : [bbox.left, bbox.bottom, bbox.right, bbox.top];
          return new BitmapLayer({ id: `${id}-bitmap`, image: data, bounds });
        },
      }),
    []
  );

  // -----------------------------
  // BAVARIA & MASK LAYERS
  // -----------------------------
  const bavariaGeoJsonLayer = useMemo(() => {
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
  }, []);

  const germanyGeoJsonLayer = useMemo(() => {
    const bavariaCoords = bavariaGeo.features[0].geometry.coordinates;
    const world = [
      [-180, -90],
      [-180, 90],
      [180, 90],
      [180, -90],
      [-180, -90],
    ];
    const holes = bavariaCoords.map((polygon) => polygon[0]);
    const maskPolygon: Feature = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [world, ...holes] },
    };

    return new GeoJsonLayer({
      id: 'mask-layer',
      data: [maskPolygon],
      filled: true,
      stroked: false,
      getFillColor: [33, 33, 33, 180],
    });
  }, []);

  // -----------------------------
  // MAP CONTROLLERS
  // -----------------------------
  const handleViewStateChange = (e: any) => setViewMapState(e.viewState);
  const handleCursor = ({ isDragging, isHovering }: any) =>
    isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab';

  return (
    <>
      <DeckGL
        controller
        layers={[
          baseMapLayer,
          bavariaGeoJsonLayer,
          germanyGeoJsonLayer,
          pollenGridCellsLayer,
          pinIconLayer,
        ]}
        style={{ width: '100vw', height: '100vh', cursor: 'pointer' }}
        viewState={viewMapState}
        onViewStateChange={handleViewStateChange}
        getCursor={handleCursor}
      />
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
