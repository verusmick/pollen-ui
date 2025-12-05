'use client';
import { getInitialViewState } from '@/app/forecast/utils';
import { DeckGL } from '@deck.gl/react';
import { useEffect, useMemo, useState } from 'react';
import { TileLayer } from '@deck.gl/geo-layers';
import {
  GeoJsonLayer,
  PolygonLayer,
  BitmapLayer,
  IconLayer,
} from '@deck.gl/layers';

import type { Feature } from 'geojson';
import germanyGeo from '@/data/germany.geo.json';

import { usePollenDetailsChartStore } from '@/app/forecast/stores';
import { getBoundsFromViewState, debounce } from '@/utils';
import { MapZoomControls } from '@/app/components';
import { MapTooltip } from '@/app/forecast/components';
import { useSidebar } from '@/app/context/SidebarContext';
export default function NowCastingMap() {
  const [viewMapState, setViewMapState] = useState(getInitialViewState);
  const [bounds, setBounds] = useState<number[] | null>(null);
  const { sidebarWidth } = useSidebar();
  const [tooltipInfo, setTooltipInfo] = useState<{
    object: any;
    x: number;
    y: number;
  } | null>(null);
  const {
    setShow: setShowPollenDetailsChart,
    latitude: pollenDetailsChartLatitude,
    longitude: pollenDetailsChartLongitude,
  } = usePollenDetailsChartStore();
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
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);

    return () => clearTimeout(timeout);
  }, [sidebarWidth]);
  return (
    <>
      <DeckGL
        initialViewState={viewMapState}
        controller={true}
        layers={[baseMapLayer, germanyGeoJsonLayer, pinIconLayer]}
        style={{ width: '100%', height: '100%', cursor: 'pointer' }}
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
