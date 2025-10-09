"use client";
import { DeckGL } from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { GeoJsonLayer, PolygonLayer } from "@deck.gl/layers";
import { useMemo, useState } from "react";

import bavariaGeo from "@/data/bavaria.geo.json";
import germanyGeo from "@/data/germany.geo.json";
import type { FeatureCollection } from "geojson";
import filterPointsInBavaria from "../utils/filterPointsInBavaria";
import { BitmapLayer } from "@deck.gl/layers";
import type { Feature } from "geojson";

// Define the grid cell size in degrees
const GRID_RESOLUTION = 0.02; // Adjust this for larger/smaller quadrants

const Mockdata  = [
  {
    "cell_id": "11.0_48.0",
    "grid_lat": 48.05,
    "grid_lon": 11.05,
    "avg_value": 0.65,
    "max_value": 0.89,
    "min_value": 0.42,
    "point_count": 156,
    "bounds": [11.0, 48.0, 11.1, 48.1],
    "polygon": [
      [11.0, 48.0],
      [11.1, 48.0],
      [11.1, 48.1],
      [11.0, 48.1],
      [11.0, 48.0]
    ]
  },
  {
    "cell_id": "11.1_48.0", 
    "grid_lat": 48.05,
    "grid_lon": 11.15,
    "avg_value": 0.35,
    "max_value": 0.52,
    "min_value": 0.18,
    "point_count": 142,
    "bounds": [11.1, 48.0, 11.2, 48.1],
    "polygon": [
      [11.1, 48.0],
      [11.2, 48.0],
      [11.2, 48.1],
      [11.1, 48.1],
      [11.1, 48.0]
    ]
  },
  {
    "cell_id": "11.0_48.1",
    "grid_lat": 48.15,
    "grid_lon": 11.05,
    "avg_value": 0.78,
    "max_value": 0.95,
    "min_value": 0.61,
    "point_count": 168,
    "bounds": [11.0, 48.1, 11.1, 48.2],
    "polygon": [
      [11.0, 48.1],
      [11.1, 48.1],
      [11.1, 48.2],
      [11.0, 48.2],
      [11.0, 48.1]
    ]
  },
  {
    "cell_id": "11.1_48.1",
    "grid_lat": 48.15,
    "grid_lon": 11.15,
    "avg_value": 0.52,
    "max_value": 0.68,
    "min_value": 0.35,
    "point_count": 151,
    "bounds": [11.1, 48.1, 11.2, 48.2],
    "polygon": [
      [11.1, 48.1],
      [11.2, 48.1],
      [11.2, 48.2],
      [11.1, 48.2],
      [11.1, 48.1]
    ]
  },
  {
    "cell_id": "11.2_48.0",
    "grid_lat": 48.05,
    "grid_lon": 11.25,
    "avg_value": 0.22,
    "max_value": 0.35,
    "min_value": 0.12,
    "point_count": 138,
    "bounds": [11.2, 48.0, 11.3, 48.1],
    "polygon": [
      [11.2, 48.0],
      [11.3, 48.0],
      [11.3, 48.1],
      [11.2, 48.1],
      [11.2, 48.0]
    ]
  },
  {
    "cell_id": "11.2_48.1",
    "grid_lat": 48.15,
    "grid_lon": 11.25,
    "avg_value": 0.45,
    "max_value": 0.62,
    "min_value": 0.28,
    "point_count": 145,
    "bounds": [11.2, 48.1, 11.3, 48.2],
    "polygon": [
      [11.2, 48.1],
      [11.3, 48.1],
      [11.3, 48.2],
      [11.2, 48.2],
      [11.2, 48.1]
    ]
  },
  {
    "cell_id": "11.0_48.2",
    "grid_lat": 48.25,
    "grid_lon": 11.05,
    "avg_value": 0.91,
    "max_value": 0.98,
    "min_value": 0.85,
    "point_count": 162,
    "bounds": [11.0, 48.2, 11.1, 48.3],
    "polygon": [
      [11.0, 48.2],
      [11.1, 48.2],
      [11.1, 48.3],
      [11.0, 48.3],
      [11.0, 48.2]
    ]
  },
  {
    "cell_id": "11.1_48.2",
    "grid_lat": 48.25,
    "grid_lon": 11.15,
    "avg_value": 0.68,
    "max_value": 0.82,
    "min_value": 0.55,
    "point_count": 155,
    "bounds": [11.1, 48.2, 11.2, 48.3],
    "polygon": [
      [11.1, 48.2],
      [11.2, 48.2],
      [11.2, 48.3],
      [11.1, 48.3],
      [11.1, 48.2]
    ]
  },
  {
    "cell_id": "11.2_48.2",
    "grid_lat": 48.25,
    "grid_lon": 11.25,
    "avg_value": 0.38,
    "max_value": 0.52,
    "min_value": 0.25,
    "point_count": 148,
    "bounds": [11.2, 48.2, 11.3, 48.3],
    "polygon": [
      [11.2, 48.2],
      [11.3, 48.2],
      [11.3, 48.3],
      [11.2, 48.3],
      [11.2, 48.2]
    ]
  },
  {
    "cell_id": "11.3_48.1",
    "grid_lat": 48.15,
    "grid_lon": 11.35,
    "avg_value": 0.15,
    "max_value": 0.28,
    "min_value": 0.08,
    "point_count": 132,
    "bounds": [11.3, 48.1, 11.4, 48.2],
    "polygon": [
      [11.3, 48.1],
      [11.4, 48.1],
      [11.4, 48.2],
      [11.3, 48.2],
      [11.3, 48.1]
    ]
  }
];

export default function ForecastMap({ pollenData }: { pollenData: any }) {
  const [hoverInfo, setHoverInfo] = useState<{
    object: any;
    x: number;
    y: number;
  } | null>(null);
  // Convert your API data to grid cells
  const gridCells = useMemo(() => {
    if (!Mockdata || Mockdata.length === 0) return [];

    return Mockdata.map((cell: any) => ({
      polygon: cell.polygon,  // Already formatted correctly!
      intensity: cell.avg_value,
      position: [cell.grid_lon, cell.grid_lat],
      statistics: {
        avg: cell.avg_value,
        max: cell.max_value, 
        min: cell.min_value,
        count: cell.point_count
      }
    }));
  }, [Mockdata]);

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

  console.log("===>", gridCells);

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
      // Hover conf
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
        // getTooltip={({ object }) => {
        //     // Alternative tooltip approach (simpler)
        //     if (object) {
        //       return {
        //         html: `
        //           <div class="p-2 bg-gray-800 text-white rounded">
        //             <strong>Intensity:</strong> ${getPollenLabel(object.intensity)}<br/>
        //             <strong>Position:</strong> ${object.position[1].toFixed(4)}, ${object.position[0].toFixed(4)}
        //           </div>
        //         `,
        //         style: {
        //           backgroundColor: '#1f2937',
        //           color: 'white',
        //           borderRadius: '8px',
        //           padding: '8px'
        //         }
        //       };
        //     }
        //     return null;
        //   }}
      />
      {renderTooltip()}
    </>
  );
}
