"use client";
import { DeckGL } from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { GeoJsonLayer, PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { useMemo, useState } from "react";

import bavariaGeo from "@/data/bavaria.geo.json";
import germanyGeo from "@/data/germany.geo.json";
import type { FeatureCollection } from "geojson";
import filterPointsInBavaria from "../utils/filterPointsInBavaria";
import { BitmapLayer } from "@deck.gl/layers";
import type { Feature } from "geojson";

// Define the grid cell size in degrees
const GRID_RESOLUTION = 0.02; // Adjust this for larger/smaller quadrants

export default function ForecastMap({
  pollenData,
  userLocation,
}: {
  pollenData: any;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  // Convert your API data to grid cells
  const gridCells = useMemo(() => {
    if (!pollenData?.length) return [];
    const heatPoints = pollenData.map((p: any) => [
      p.lat,
      p.long,
      p.value || 0.5,
    ]);
    const filteredPoints = filterPointsInBavaria(heatPoints);
    return filteredPoints.map(([lat, lon, intensity = 0.5]) => {
      const halfCell = 0.02 / 2;
      const quadrant = [
        [lon - halfCell, lat - halfCell],
        [lon + halfCell, lat - halfCell],
        [lon + halfCell, lat + halfCell],
        [lon - halfCell, lat + halfCell],
        [lon - halfCell, lat - halfCell],
      ];
      return { polygon: quadrant, intensity, position: [lon, lat] };
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
   
    new TileLayer({
      id: "base-map",
      data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: (props) => {
        const { bbox, data, id } = props.tile;
        const bounds =
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

   
    maskLayer,

    
    userLocation &&
      new ScatterplotLayer({
        id: "user-location",
        data: [userLocation],
        getPosition: (d: any) => [d.lng, d.lat],
        getRadius: 500,
        getFillColor: [66, 133, 244, 255], 
        radiusMinPixels: 6,
        radiusMaxPixels: 10,
      }),

    
    new PolygonLayer({
      id: "pollen-grid",
      data: gridCells,
      getPolygon: (d: any) => d.polygon,
      getFillColor: (d: any) => {
        const i = d.intensity;
        if (i <= 0.2) return [0, 100, 0, 60];
        else if (i <= 0.4) return [154, 205, 50, 60];
        else if (i <= 0.6) return [255, 255, 0, 60];
        else if (i <= 0.8) return [255, 165, 0, 60];
        return [255, 0, 0, 60];
      },
      filled: true,
      stroked: true,
      pickable: true,
      onHover: (info) =>
        setHoverInfo(
          info.object ? { object: info.object, x: info.x, y: info.y } : null
        ),
    }),
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
          longitude: userLocation?.lng || 10.5,
          latitude: userLocation?.lat || 51,
          zoom: userLocation ? 12 : 6.5,
          minZoom: 5,
          maxZoom: 14,
        }}
        controller={true}
        layers={layers.filter(Boolean)}
        style={{ width: "100vw", height: "100vh" }}
      />
    </>
  );
}
