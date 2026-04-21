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

import { MapTooltip } from '@/app/forecast/components';

import filterPointsInRegion from '@/utils/deck/filterPointsInRegion';
import { debounce, getBoundsFromViewState } from '@/utils';
import { getInitialViewState } from '@/app/forecast/utils';
import { MapZoomControls } from '@/app/components';
import {
  useCurrentLocationStore,
  usePartialLoadingStore,
  useSearchLocationStore,
} from '@/app/stores';
import { getRegionGeo } from '@/app/utils/maps';
import { usePollenChart } from '@/app/hooks';
import { usePollenDetailsChartStore } from '@/app/stores/pollen';

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_MAPTILER_MAP_ID = 'dataviz-v4';
const MAPTILER_LOGO_URL = 'https://api.maptiler.com/resources/logo.svg';

type BaseMapConfig = {
  attribution: string;
  attributionType: 'custom' | 'maptiler' | 'osm';
  maxZoom: number;
  showMapTilerLogo: boolean;
  tileUrl: string;
};

const getNumberEnv = (envValue: string | undefined, fallback: number) => {
  const value = Number(envValue);

  return Number.isFinite(value) ? value : fallback;
};

const getBaseMapConfig = (): BaseMapConfig => {
  const customTileUrl = process.env.NEXT_PUBLIC_BASE_MAP_TILE_URL?.trim();

  if (customTileUrl) {
    const attribution = process.env.NEXT_PUBLIC_BASE_MAP_ATTRIBUTION?.trim();
    const isMapTiler = customTileUrl.includes('api.maptiler.com');

    return {
      attribution:
        attribution ||
        (isMapTiler
          ? '© MapTiler © OpenStreetMap contributors'
          : '© OpenStreetMap contributors'),
      attributionType: attribution ? 'custom' : isMapTiler ? 'maptiler' : 'osm',
      maxZoom: getNumberEnv(process.env.NEXT_PUBLIC_BASE_MAP_MAX_ZOOM, 19),
      showMapTilerLogo:
        process.env.NEXT_PUBLIC_BASE_MAP_SHOW_MAPTILER_LOGO === 'true' ||
        isMapTiler,
      tileUrl: customTileUrl,
    };
  }

  const mapTilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY?.trim();

  if (mapTilerApiKey) {
    const mapId =
      process.env.NEXT_PUBLIC_MAPTILER_MAP_ID?.trim() ||
      DEFAULT_MAPTILER_MAP_ID;

    return {
      attribution: '© MapTiler © OpenStreetMap contributors',
      attributionType: 'maptiler',
      maxZoom: getNumberEnv(process.env.NEXT_PUBLIC_BASE_MAP_MAX_ZOOM, 22),
      showMapTilerLogo: true,
      tileUrl: `https://api.maptiler.com/maps/${mapId}/256/{z}/{x}/{y}.png?key=${encodeURIComponent(mapTilerApiKey)}`,
    };
  }

  return {
    attribution: '© OpenStreetMap contributors',
    attributionType: 'osm',
    maxZoom: getNumberEnv(process.env.NEXT_PUBLIC_BASE_MAP_MAX_ZOOM, 19),
    showMapTilerLogo: false,
    tileUrl: OSM_TILE_URL,
  };
};

const attributionLinkStyle = {
  color: '#333',
  textDecoration: 'none',
};

// Define the grid cell size in degrees
// const GRID_RESOLUTION = 0.02; // Adjust this for larger/smaller quadrants

export default function ForecastMap({
  pollenData,
  onRegionChange,
  pollenSelected,
  currentDate,
  gridCellsResolution,
}: {
  pollenData: any;
  pollenSelected: string;
  currentDate: string;
  gridCellsResolution: number;
  onRegionChange: (arg: {
    bBox: [number, number, number, number];
    zoom: number;
  }) => void;
}) {
  const [viewMapState, setViewMapState] = useState(getInitialViewState);
  const { setChartLoading } = usePartialLoadingStore();
  const [tooltipInfo, setTooltipInfo] = useState<{
    object: any;
    x: number;
    y: number;
  } | null>(null);
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
  const { fetchChart } = usePollenChart();
  const baseMapConfig = useMemo(() => getBaseMapConfig(), []);
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
          forecast: { hour: 0 },
        });
      } catch (error) {
        console.error(error);
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

  // Convert your API data to grid cells
  const gridCells = useMemo(() => {
    if (!pollenData || pollenData.length === 0) return [];
    const filteredPoints = filterPointsInRegion(pollenData, getRegionGeo());
    // const filteredPoints = pollenData;
    // Create grid cells from filtered points
    return filteredPoints.map(([lat, lon, intensity = 0.5]) => {
      // Create a square quadrant around each point
      const halfCell = gridCellsResolution / 2;

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

  const pollenGridCellsLayer = useMemo(
    () =>
      new PolygonLayer({
        id: 'pollen-grid',
        data: gridCells,
        getPolygon: (d: any) => d.polygon,
        getFillColor: (d: any) => {
          const intensity = d.intensity;
          // Your color scale based on pollen intensity
          if (intensity <= 0) return [0, 0, 0, 0]; // None
          else if (intensity <= 0.2) return [255, 255, 0, 60]; // Very low
          else if (intensity <= 0.4) return [255, 165, 0, 60]; // Low
          else if (intensity <= 0.6) return [255, 0, 0, 60]; // Moderate
          else if (intensity <= 0.8) return [128, 0, 128, 60]; // High
          else return [0, 0, 139, 80]; // Very high
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
      }),
    [gridCells, handleGridCellClick]
  );

  const pinIconLayer = useMemo(() => {
    if (!pollenDetailsChartLatitude || !pollenDetailsChartLongitude)
      return null;

    return new IconLayer({
      id: 'search-marker',
      data: [
        {
          position: [pollenDetailsChartLongitude, pollenDetailsChartLatitude],
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
    });
  }, [pollenDetailsChartLatitude, pollenDetailsChartLongitude, name]);

  const baseMapLayer = useMemo(
    () =>
      new TileLayer({
        id: 'base-map',
        data: baseMapConfig.tileUrl,
        minZoom: 0,
        maxZoom: baseMapConfig.maxZoom,
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
      }),
    [baseMapConfig]
  );

  // Bavaria boundary
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

  const debouncedRegionUpdate = useRef(
    debounce((viewState) => {
      const bBox = getBoundsFromViewState(viewState);
      const zoom = viewState.zoom;

      onRegionChange?.({ bBox, zoom });
    }, 80)
  ).current;

  const handleViewStateChange = useCallback((e: any) => {
    const nextViewState = e.viewState;
    setViewMapState(nextViewState);
    debouncedRegionUpdate(nextViewState);
  }, []);

  const handleCursor = useCallback(({ isDragging, isHovering }: any) => {
    if (isDragging) return 'grabbing';
    if (isHovering) return 'pointer';
    return 'grab';
  }, []);
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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <DeckGL
        initialViewState={viewMapState}
        controller={true}
        layers={[
          baseMapLayer,
          bavariaGeoJsonLayer,
          germanyGeoJsonLayer,
          pollenGridCellsLayer,
          pinIconLayer,
        ]}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
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
      {baseMapConfig.showMapTilerLogo && (
        <a
          href="https://www.maptiler.com"
          target="_blank"
          rel="noreferrer"
          style={{
            position: 'absolute',
            left: 8,
            bottom: 8,
            zIndex: 1,
            pointerEvents: 'auto',
          }}
        >
          <img
            src={MAPTILER_LOGO_URL}
            alt="MapTiler"
            style={{ display: 'block', height: 24 }}
          />
        </a>
      )}
      <div
        style={{
          position: 'absolute',
          right: 8,
          bottom: 8,
          zIndex: 1,
          maxWidth: 'calc(100% - 16px)',
          padding: '2px 6px',
          background: 'rgba(255, 255, 255, 0.86)',
          borderRadius: 4,
          color: '#333',
          fontSize: 11,
          lineHeight: '16px',
          pointerEvents: 'auto',
        }}
      >
        {baseMapConfig.attributionType === 'maptiler' ? (
          <>
            <a
              href="https://www.maptiler.com/copyright/"
              target="_blank"
              rel="noreferrer"
              style={attributionLinkStyle}
            >
              © MapTiler
            </a>{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
              style={attributionLinkStyle}
            >
              © OpenStreetMap contributors
            </a>
          </>
        ) : baseMapConfig.attributionType === 'osm' ? (
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            style={attributionLinkStyle}
          >
            © OpenStreetMap contributors
          </a>
        ) : (
          baseMapConfig.attribution
        )}
      </div>
    </div>
  );
}
