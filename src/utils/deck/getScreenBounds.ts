import { WebMercatorViewport } from '@deck.gl/core';
interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
  width?: number;
  height?: number;
}
export function getBoundsFromViewState(viewState: ViewState) {
  const { width = window.innerWidth, height = window.innerHeight, ...rest } = viewState;
  const viewport = new WebMercatorViewport({ width, height, ...rest });

  // corners of the screen
  const nw = viewport.unproject([0, 0]);
  const se = viewport.unproject([width, height]);

  const minLon = nw[0];
  const maxLon = se[0];
  const minLat = se[1];
  const maxLat = nw[1];

  return [minLon, minLat, maxLon, maxLat] as [number, number, number, number];
}