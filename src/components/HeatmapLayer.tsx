"use client";
import { createLayerComponent, LayerProps } from "@react-leaflet/core";
import L from "leaflet";
import "leaflet.heat";

declare module "leaflet" {
interface HeatLayerOptions extends L.LayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    radius?: number;
    blur?: number;
    max?: number;
    gradient?: { [key: number]: string };
  }
  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: [number, number, number?][]): this;
    setOptions(options: L.HeatLayerOptions): this;
  }
}
interface HeatmapProps extends LayerProps {
  points: [number, number, number?][]; // [lat, lng, intensity?]
  options?: L.HeatLayerOptions;
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
    if (props.options && props.options !== prevProps.options) {
      layer.setOptions(props.options);
    }
  }
);

export default HeatmapLayer;