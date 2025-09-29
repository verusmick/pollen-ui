"use client";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import bavariaGeo from "@/data/bavaria.geo.json";
import germanyGeo from "@/data/germany.geo.json";
import HeatmapLayer from "./HeatmapLayer";
import filterPointsInBavaria from "../utils/filterPointsInBavaria";

export default function ForecastMap({ pollenData }: { pollenData: any }) {
  // Convert pollenData into [lat, lon, intensity] for heatmap
  const heatPoints: [number, number, number?][] = pollenData.map(
    // (point: any) => [point.lat, point.long, point.value ? point.value:  0.5]
    (point: any) => [point.lat, point.long, 0.5]
  );

  const filteredHeatPoints = filterPointsInBavaria(heatPoints);

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
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Pollen Heatmap */}
      <HeatmapLayer
        points={filteredHeatPoints}
        // points={heatPoints}
        options={{ radius: 25, blur: 15, maxZoom: 17 }}
      />

      <GeoJSON
        data={bavariaGeo as any}
        style={() => ({
          fillColor: "transparent",
          color: "#4e4d4d",
          // fillOpacity: 0.5,
          weight: 1.5,
        })}
      />
      {/* Gray everything outside of Gemany */}
      <GeoJSON
        data={mask as any}
        style={() => ({
          fillColor: "#212121",
          // color: "#212121",
          color: "#A0BCE8",
          fillOpacity: 0.5,
          weight: 2,
        })}
      />
    </MapContainer>
  );
}
