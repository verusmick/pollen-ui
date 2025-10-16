"use client";
import { DeckGL } from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { GeoJsonLayer, PolygonLayer } from "@deck.gl/layers";
import { useMemo, useState } from "react";

import bavariaGeo from "@/data/bavaria.geo.json";
import germanyGeo from "@/data/germany.geo.json";
import type { FeatureCollection } from "geojson";

import { BitmapLayer } from "@deck.gl/layers";
import type { Feature } from "geojson";
import filterPointsInRegion from "../utils/filterPointsInRegion";

// Define the grid cell size in degrees
const GRID_RESOLUTION = 0.02; // Adjust this for larger/smaller quadrants

export default function ForecastMap({ pollenData }: { pollenData: any }) {
  const [hoverInfo, setHoverInfo] = useState<{
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

  // Create mask for area outside Germany
  const maskLayer = useMemo(() => {
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

  const layers = [
    // Free OpenStreetMap base layer
    new TileLayer({
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
    }),

    // Pollen grid cells layer
    new PolygonLayer({
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
          setHoverInfo({
            object: info.object,
            x: info.x,
            y: info.y,
          });
        } else {
          setHoverInfo(null); // Hide tooltip when not hovering
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
    }),

    // Bavaria boundary
    new GeoJsonLayer({
      id: "bavaria-boundary",
      data: bavariaGeo as FeatureCollection,
      filled: false,
      stroked: true,
      getLineColor: [78, 77, 77],
      lineWidthMinPixels: 1.5,
      getLineWidth: 1,
    }),

    // Mask outside area
    maskLayer,
  ];

  function renderTooltip() {
    if (!hoverInfo || !hoverInfo.object) return null;

    const { object, x, y } = hoverInfo;
    const intensity = object.intensity;

    // Convert intensity to pollen level text
    const pollenLevel =
      intensity <= 0.2
        ? "Very Low"
        : intensity <= 0.4
        ? "Low"
        : intensity <= 0.6
        ? "Medium"
        : intensity <= 0.8
        ? "High"
        : "Very High";

    return (
      <div
        className="absolute pointer-events-none z-50"
        style={{ left: x, top: y, transform: "translate(-50%, -100%)" }}
      >
        <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs">
          <div className="font-semibold">Pollen Information</div>
          {/* <div>Intensity: {(intensity * 10).toFixed(1)}</div> */}
          <div>Level: {pollenLevel}</div>
          <div>Lat: {object.position[1].toFixed(4)}</div>
          <div>Lon: {object.position[0].toFixed(4)}</div>
        </div>
        {/* Tooltip arrow */}
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 
                        border-8 border-transparent border-t-gray-800"
        />
      </div>
    );
  }

  return (
    <>
      <DeckGL
        initialViewState={{
          longitude: 10.5,
          latitude: 51,
          zoom: 6.5,
          minZoom: 5,
          maxZoom: 12,
        }}
        controller={true}
        layers={layers}
        style={{ width: "100vw", height: "100vh" }}
      />
      {renderTooltip()}
    </>
  );
}
