"use client";
import { DeckGL } from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { GeoJsonLayer, PolygonLayer } from "@deck.gl/layers";
import { useMemo } from "react";

import bavariaGeo from "@/data/bavaria.geo.json";
import germanyGeo from "@/data/germany.geo.json";
import filterPointsInBavaria from "../utils/filterPointsInBavaria";
import { BitmapLayer } from "@deck.gl/layers";

// Define the grid cell size in degrees
const GRID_RESOLUTION = 0.02; // Adjust this for larger/smaller quadrants

export default function ForecastMap({ pollenData }: { pollenData: any }) {
  // Convert your API data to grid cells
  const gridCells = useMemo(() => {
    if (!pollenData || pollenData.length === 0) return [];

    // Convert to the format your filter expects
    const heatPoints: [number, number, number?][] = pollenData.map(
      (point: any) => [point.lat, point.long, point.value || 0.5]
    );

    // const filteredPoints = filterPointsInBavaria(heatPoints);
    const filteredPoints = filterPointsInBavaria(heatPoints);

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

    const maskPolygon = {
      type: "Feature",
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
      data: maskPolygon,
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
        const {
          bbox: { west, south, east, north },
          data,
          id,
        } = props.tile;

        return new BitmapLayer({
          id: `${id}-bitmap`,
          image: data,
          bounds: [west, south, east, north],
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
    }),

    // Bavaria boundary
    new GeoJsonLayer({
      id: "bavaria-boundary",
      data: bavariaGeo,
      filled: false,
      stroked: true,
      getLineColor: [78, 77, 77],
      lineWidthMinPixels: 1.5,
      getLineWidth: 1,
    }),

    // Mask outside area
    maskLayer,
  ];

  return (
    <DeckGL
      initialViewState={{
        longitude: 10.5,
        latitude: 51,
        zoom: 6.5,
        minZoom: 5,
        maxZoom: 12,
      }}
      controller={{
        maxZoom: 12,
        minZoom: 5,
      }}
      layers={layers}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
