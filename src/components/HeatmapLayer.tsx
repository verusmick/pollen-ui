"use client";
import { createLayerComponent } from "@react-leaflet/core";
import L from "leaflet";
import "leaflet.heat";

interface HeatmapProps {
  points: [number, number, number?][]; // [lat, lng, intensity?]
  options?: L.HeatMapOption;
}

const HeatmapLayer = createLayerComponent<L.HeatLayer, HeatmapProps>(
  function createHeatLayer({ points, options }, ctx) {
    const instance = (L as any).heatLayer(points, options);
    return { instance, context: ctx };
  },
  function updateHeatLayer(layer, props, prevProps) {
    if (props.points !== prevProps.points) {
      layer.setLatLngs(props.points);
    }
    if (props.options !== prevProps.options) {
      layer.setOptions(props.options);
    }
  }
);

export default HeatmapLayer;