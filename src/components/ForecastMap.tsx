"use client";
import { MapContainer, TileLayer, GeoJSON, Rectangle, Circle, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import bavariaGeo from "@/data/bavaria.geo.json";
import germanyGeo from "@/data/germany.geo.json";
import HeatmapLayer from "./HeatmapLayer";
import filterPointsInBavaria from "../utils/filterPointsInBavaria";
import { LatLngBounds } from "leaflet";
import { useMemo } from "react";

interface GridCell {
  id: string;
  bounds: LatLngBounds;
  pollenIntensity: number;
  pointCount: number;
  center: [number, number];
}

interface PollenPoint {
  lat: number;
  lng: number;
  intensity: number;
}


export default function ForecastMap({ pollenData }: { pollenData: any }) {
  // Convert pollenData into [lat, lon, intensity] for heatmap
  const heatPoints: [number, number, number?][] = pollenData.map(
    (point: any) => [point.lat, point.long, point.value ? point.value:  0.5]
    // (point: any) => [point.lat, point.long, 0.9]
    // (point: any) => [point.lat, point.long, 10]
  );

  const filteredHeatPoints = filterPointsInBavaria(heatPoints);
  console.log(JSON.stringify(filteredHeatPoints));

  // Extract Bavaria's multipolygon coordinates
  const bavariaCoords =
    germanyGeo.features[0].geometry.type === "MultiPolygon"
      ? germanyGeo.features[0].geometry.coordinates
      : [germanyGeo.features[0].geometry.coordinates];

  // Build mask polygon with world outline + Bavaria holes
  const mask = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        // World rectangle (outer ring)
        [
          [-180, -90],
          [-180, 90],
          [180, 90],
          [180, -90],
          [-180, -90],
        ],
        // Flatten each polygon ring in MultiPolygon
        ...bavariaCoords.map((polygon) => polygon[0]),
      ],
    },
  };
const gridSize = 0.07

  const pollenPoints: PollenPoint[] = useMemo(() => {
    return filteredHeatPoints.map(([lat, lng, intensity]) => ({
      lat,
      lng,
      intensity
    }));
  }, [filteredHeatPoints]);

  // Create grid cells from pollen data
  const gridCells: GridCell[] = useMemo(() => {
    const cells = new Map<string, GridCell>();
    
    pollenPoints.forEach(point => {
      // Calculate grid cell coordinates
      const gridLat = Math.floor(point.lat / gridSize) * gridSize;
      const gridLng = Math.floor(point.lng / gridSize) * gridSize;
      const cellKey = `${gridLat},${gridLng}`;
      
      if (!cells.has(cellKey)) {
        const bounds = new LatLngBounds(
          [gridLat, gridLng],
          [gridLat + gridSize, gridLng + gridSize]
        );
        
        cells.set(cellKey, {
          id: cellKey,
          bounds,
          pollenIntensity: 0,
          pointCount: 0,
          center: [gridLat + gridSize / 2, gridLng + gridSize / 2]
        });
      }
      
      const cell = cells.get(cellKey)!;
      cell.pollenIntensity += point.intensity;
      cell.pointCount += 1;
    });
    
    // Calculate average intensity for each cell
    Array.from(cells.values()).forEach(cell => {
      if (cell.pointCount > 0) {
        cell.pollenIntensity = cell.pollenIntensity / cell.pointCount;
      }
    });
    
    return Array.from(cells.values());
  }, [pollenPoints, gridSize]);

    // Get color based on pollen intensity
  // const getColorByIntensity = (intensity: number): string => {
  //   if (intensity <= 0.1) return '#4CAF50'; // Green - very low
  //   if (intensity <= 0.3) return '#8BC34A'; // Light green - low
  //   if (intensity <= 0.5) return '#FFEB3B'; // Yellow - moderate
  //   if (intensity <= 0.7) return '#FF9800'; // Orange - high
  //   return '#F44336'; // Red - very high
  // };
  const getColorByIntensity = (intensity: number): string => {
    if (intensity <= 1) return '#4CAF50'; // Green - very low
    if (intensity <= 3) return '#8BC34A'; // Light green - low
    if (intensity <= 5) return '#FFEB3B'; // Yellow - moderate
    if (intensity <= 7) return '#FF9800'; // Orange - high
    return '#F44336'; // Red - very high
  };

  const getRiskLevel = (intensity: number): string => {
    if (intensity <= 0.1) return 'Very Low';
    if (intensity <= 0.3) return 'Low';
    if (intensity <= 0.5) return 'Moderate';
    if (intensity <= 0.7) return 'High';
    return 'Very High';
  };

  return (
    <MapContainer
      center={[51, 10.5]}
      style={{
        height: "100vh",
        width: "100vw",
        top: 0,
      }}
      maxBoundsViscosity={1.0}
      zoom={6.5}
      zoomControl={false}
      maxZoom={12}
      // scrollWheelZoom={false}
      // dragging={false}
      minZoom={5}
      touchZoom={false}
      doubleClickZoom={false}
      boxZoom={false}
      keyboard={false}
      maxBounds={[
        [34, -10], // Southwest (lat, lon)
        [72, 32], // Northeast (lat, lon)
      ]}
    >
      {/* <TileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      /> */}
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Pollen Heatmap */}
      {/* <HeatmapLayer
        points={filteredHeatPoints}
        // options={{ radius: 25, blur: 15, maxZoom: 17 }}
       options={{
    radius: 25,
    blur: 15,
    maxZoom: 17,
    // Add these 👇
    max: 10,          // set depending on your max pollen "value"
    minOpacity: 0.3,  // keeps faint values visible
  }}
      /> */}

      {/* Render grid cells */}
      {gridCells.map((cell) => (
        <Rectangle
          key={cell.id}
          bounds={cell.bounds}
          pathOptions={{
            fillColor: getColorByIntensity(cell.pollenIntensity),
            fillOpacity: 0.4,
            // color: "#333",
            color: "transparent",
            weight: 1,
            opacity: 0.8,
          }}

        >
        </Rectangle>
      ))}

      {/* Boundary of Bavaria */}
      <GeoJSON
        data={bavariaGeo as any}
        style={() => ({
          fillColor: "transparent",
          color: "#4e4d4d",
          weight: 1.5,
        })}
      />
      {/* Gray everything outside of Gemany */}
      <GeoJSON
        data={mask as any}
        style={() => ({
          fillColor: "#212121",
          color: "#A0BCE8",
          fillOpacity: 0.5,
          weight: 2,
        })}
      />
    </MapContainer>
  );
}
