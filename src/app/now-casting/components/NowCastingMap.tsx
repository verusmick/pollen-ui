'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import {
  GeoJsonLayer,
  PolygonLayer,
  BitmapLayer,
  IconLayer,
} from '@deck.gl/layers';
import { FlyToInterpolator } from 'deck.gl';
import type { Feature, FeatureCollection } from 'geojson';
import dayjs from 'dayjs';

import { MapZoomControls } from '@/app/components';
import {
  useCurrentLocationStore,
  usePartialLoadingStore,
  useSearchLocationStore,
} from '@/app/stores';
import { usePollenDetailsChartStore } from '@/app/stores/pollen';
import { getInitialViewState } from '@/app/now-casting/utils';
import { getRegionGeo } from '@/app/utils/maps';
import { usePollenChart } from '@/app/hooks';
import filterPointsInRegion from '@/utils/deck/filterPointsInRegion';
import { debounce, getBoundsFromViewState } from '@/utils';
import bavariaGeo from '@/data/bavaria.geo.json';
import germanyGeo from '@/data/germany.geo.json';

interface NowCastingMapProps {
  pollenData: Array<[number, number, number | null]>;
  gridCellsResolution: number;
  userLocation: { lat: number; lng: number } | null;
  pollenSelected: string;
  currentDate: string;
  onRegionChange: (arg: {
    bBox: [number, number, number, number];
    zoom: number;
  }) => void;
}

export default function NowCastingMap({
  pollenData,
  gridCellsResolution,
  userLocation,
  pollenSelected,
  currentDate,
  onRegionChange,
}: NowCastingMapProps) {
  const [viewMapState, setViewMapState] = useState(getInitialViewState);

  const { setChartLoading } = usePartialLoadingStore();
  const { fetchChart } = usePollenChart();
  const { lat: searchLat, lng: searchlong, name } = useSearchLocationStore();
  const {
    setShow: setShowPollenDetailsChart,
    latitude: pollenDetailsChartLatitude,
    longitude: pollenDetailsChartLongitude,
  } = usePollenDetailsChartStore();
  const {
    lat: currentLocationLat,
    lng: currentLocationLong,
    clearLocation: clearCurrentLocation,
  } = useCurrentLocationStore((state) => state);

  const debouncedRegionUpdate = useRef(
    debounce((viewState) => {
      const bBox = getBoundsFromViewState(viewState);
      const zoom = viewState.zoom;

      onRegionChange?.({ bBox, zoom });
    }, 80)
  ).current;

  const handleGridCellClick = useCallback(
    async (clickLat: number, clickLon: number) => {
      setShowPollenDetailsChart(true, '', null, clickLat, clickLon);
      setChartLoading(true);
      const nowRaw = dayjs();
      const alignedHour = Math.floor(nowRaw.hour() / 3) * 3;

      try {
        await fetchChart({
          lat: clickLat,
          lng: clickLon,
          pollen: pollenSelected,
          date: currentDate,
          nowcasting: { hour: alignedHour, nhours: 48 },
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

  const gridCells = useMemo(() => {
    if (!pollenData || pollenData.length === 0) return [];

    const filteredPoints = filterPointsInRegion(pollenData, getRegionGeo());

    return filteredPoints.map(([lat, lon, intensityRaw]) => {
      const intensity = typeof intensityRaw === 'number' ? intensityRaw : 0;
      const halfCell = 0.0042;

      const quadrant = [
        [lon - halfCell, lat - halfCell], // bottom-left
        [lon + halfCell, lat - halfCell], // bottom-right
        [lon + halfCell, lat + halfCell], // top-right
        [lon - halfCell, lat + halfCell], // top-left
        [lon - halfCell, lat - halfCell],
      ];

      return { polygon: quadrant, intensity, position: [lon, lat] };
    });
  }, [pollenData, gridCellsResolution]);

  const pollenGridCellsLayer = useMemo(
    () =>
      new PolygonLayer({
        id: 'pollen-grid',
        data: gridCells,
        getPolygon: (d: any) => d.polygon,
        getFillColor: (d: any) => {
          const intensity = d.intensity;
          if (intensity <= 0.2) return [0, 100, 0, 60]; // Dark Green - low
          else if (intensity <= 0.4) return [154, 205, 50, 60]; // Yellow Green
          else if (intensity <= 0.6) return [255, 255, 0, 60]; // Yellow
          else if (intensity <= 0.8) return [255, 165, 0, 60]; // Orange
          else return [255, 0, 0, 60]; // Red - high
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
          const pos = info.object.position;
          if (!pos || pos.length < 2) return;
          const [lon, lat] = pos;
          handleGridCellClick(lat, lon);
        },
      }),
    [gridCells, handleGridCellClick]
  );

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
      getPosition: (d: any) => d.position,
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

  const baseMapLayer = useMemo(
    () =>
      new TileLayer({
        id: 'base-map',
        data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,
        renderSubLayers: (props: any) => {
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
    const bavariaCoords = germanyGeo.features[0].geometry.coordinates;
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

  const handleViewStateChange = (e: any) => {
    const nextViewState = e.viewState;
    setViewMapState(nextViewState);
    debouncedRegionUpdate(nextViewState);
  };

  const handleCursor = ({ isDragging, isHovering }: any) =>
    isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab';

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

  const layers = [
    baseMapLayer,
    bavariaGeoJsonLayer,
    germanyGeoJsonLayer,
    pollenGridCellsLayer,
    pinIconLayer,
  ].filter(Boolean) as any[];

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
        controller
        layers={layers}
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
