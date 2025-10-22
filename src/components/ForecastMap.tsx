"use client";
import { useMemo, useState, useEffect } from "react";
import { DeckGL } from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { GeoJsonLayer, PolygonLayer } from "@deck.gl/layers";
import { BitmapLayer, IconLayer } from "@deck.gl/layers";
import { FlyToInterpolator } from "@deck.gl/core";

import bavariaGeo from "@/data/bavaria.geo.json";
import germanyGeo from "@/data/germany.geo.json";

import MapZoomControls from "./MapZoomControls";
import MapTooltip from "./MapTooltip";

import filterPointsInRegion from "../utils/filterPointsInRegion";
import { useSearchLocationStore } from "@/store/searchLocationStore";

import type { Feature } from "geojson";
import type { FeatureCollection } from "geojson";

// Define the grid cell size in degrees
const GRID_RESOLUTION = 0.02; // Adjust this for larger/smaller quadrants

export default function ForecastMap({ pollenData }: { pollenData: any }) {
  const [viewMapState, setViewMapState] = useState({
    longitude: 10.5,
    latitude: 51,
    zoom: 6.5,
    minZoom: 5,
    maxZoom: 12,
  });
  const { lat, lng, name, boundingbox } = useSearchLocationStore();

  const [tooltipInfo, setTooltipInfo] = useState<{
    object: any;
    x: number;
    y: number;
  } | null>(null);

  // Convert your API data to grid cells
  const gridCells = useMemo(() => {
    if (!pollenData || pollenData.length === 0) return [];
    const filteredPoints = filterPointsInRegion(pollenData, bavariaGeo);
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

  // Free OpenStreetMap base layer
  const baseMapLayer = new TileLayer({
    id: "base-map",
    data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    renderSubLayers: (props) => {
      const { bbox, data, id } = props.tile;

      // Handle different types of bounding boxes
      const bounds: [number, number, number, number] =
        "west" in bbox
          ? [bbox.west, bbox.south, bbox.east, bbox.north]
          : [bbox.left, bbox.bottom, bbox.right, bbox.top];

      return new BitmapLayer({
        id: `${id}-bitmap`,
        image: data,
        bounds,
      });
    },
  });

  const pollenGridCellsLayer = new PolygonLayer({
    id: "pollen-grid",
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
      if (info.object) {
        setTooltipInfo({
          object: info.object,
          x: info.x,
          y: info.y,
        });
      } else {
        setTooltipInfo(null); // Hide tooltip when not hovering
      }
    },
    onClick: (info: any) => {
      // // Show tooltip on hover
      // if (info.object) {
      //   setHoverInfo({
      //     object: info.object,
      //     x: info.x,
      //     y: info.y,
      //   });
      // } else {
      //   setHoverInfo(null); // Hide tooltip when not hovering
      // }
    },
  });

  // Bavaria boundary
  const bavariaGeoJsonLayer = new GeoJsonLayer({
    id: "bavaria-boundary",
    data: bavariaGeo as FeatureCollection,
    filled: false,
    stroked: true,
    getLineColor: [78, 77, 77],
    lineWidthMinPixels: 1.5,
    getLineWidth: 1,
  });

  // Create mask for area outside Germany
  const germanyGeoJsonLayer = useMemo(() => {
    const bavariaCoords = germanyGeo.features[0].geometry.coordinates;

    const maskPolygon: Feature = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
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
      id: "mask-layer",
      data: [maskPolygon],
      filled: true,
      stroked: false,
      getFillColor: [33, 33, 33, 180], // Dark gray
    });
  }, []);

  const pinIconLayer =
    lat && lng
      ? new IconLayer({
          id: "search-marker",
          data: [{ position: [lng, lat], name }],
          getIcon: () => "marker",
          getColor: (d) => [33, 33, 33],
          getPosition: (d) => d.position,
          getSize: () => 41,
          iconAtlas: "/map_icon.png",
          iconMapping: {
            marker: {
              x: 0,
              y: 0,
              width: 128,
              height: 128,
              anchorY: 128,
              mask: true,
            },
            "marker-warning": {
              x: 128,
              y: 0,
              width: 128,
              height: 128,
              anchorY: 128,
              mask: false,
            },
          },
          pickable: true,
        })
      : null;

  const handleViewStateChange = (e: any) =>
    setViewMapState({
      ...(e.viewState as {
        longitude: number;
        latitude: number;
        zoom: number;
        minZoom: number;
        maxZoom: number;
      }),
    });

  // watcher to check the properties of the map
  useEffect(() => {
    if (lat && lng) {
      setViewMapState((prev) => ({
        ...prev,
        longitude: lng,
        latitude: lat,
        zoom: 10,
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
      }));
    }
  }, [lat, lng]);

  return (
    <>
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
        style={{ width: "100vw", height: "100vh" }}
        viewState={viewMapState}
        // This is triggered when the hand move the map
        onViewStateChange={handleViewStateChange}
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
