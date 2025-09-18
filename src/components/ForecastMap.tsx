"use client";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import bavariaGeo from "@/data/bavaria.geo.json";

export default function ForecastMap() {
  // Extract Bavaria's multipolygon coordinates
  const bavariaCoords =
    bavariaGeo.features[0].geometry.type === "MultiPolygon"
      ? bavariaGeo.features[0].geometry.coordinates
      : [bavariaGeo.features[0].geometry.coordinates];

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
      center={[48.5, 11.5]}
      zoom={7}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Show Bavaria border */}
      <GeoJSON
        data={bavariaGeo as any}
        style={() => ({
          fillColor: "transparent",
          color: "blue",
          weight: 2,
        })}
      />

      {/* Gray everything outside Bavaria */}
      <GeoJSON
        data={mask as any}
        style={() => ({
          fillColor: "rgba(200,200,200,0.7)",
          color: "none",
        })}
      />
    </MapContainer>
  );
}
