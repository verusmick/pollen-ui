"use client";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import bavariaGeo from "@/data/bavaria.geo.json";
import HeatmapLayer from "./HeatmapLayer";

export default function ForecastMap({ pollenData }: { pollenData: any }) {
  // console.log("heat pollen data", JSON.stringify(pollenData));

  // Convert pollenData into [lat, lon, intensity] for heatmap
  const heatPoints: [number, number, number?][] = pollenData.map(
    (point: any) => [point.lat, point.long, point.value ? point.value:  0.5]
  );

  console.log('==>', heatPoints)
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
      center={[49, 11.6]}
      style={{
        height: "100vh",
        width: "100vw",
        top: 0,
      }}
      maxBoundsViscosity={1.0}
      zoom={8.5}
      zoomControl={false}
      // scrollWheelZoom={false}
      // dragging={false}
      minZoom={6}
      touchZoom={false}
      doubleClickZoom={false}
      boxZoom={false}
      keyboard={false}
      maxBounds={[
        [47, 5.8663], // Southwest (lat, lon)
        [55.0581, 15.941], // Northeast (lat, lon)
      ]}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Pollen Heatmap */}
      <HeatmapLayer
        points={heatPoints}
        options={{ radius: 25, blur: 15, maxZoom: 17 }}
      />

      {/* Gray everything outside Bavaria */}
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
