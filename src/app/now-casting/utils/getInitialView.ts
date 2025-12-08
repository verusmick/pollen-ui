import { REGION_BOUNDS } from "@/app/constants";

export const getInitialViewState = () => {
  // const region = process.env.NEXT_PUBLIC_REGION?.toUpperCase() || 'BAVARIA';
  const region = 'BAVARIA';
  const bbox = REGION_BOUNDS[region] || REGION_BOUNDS.BAVARIA;

  const [minLon, minLat, maxLon, maxLat] = bbox;

  // Calculate center
  const longitude = (minLon + maxLon) / 2;
  const latitude = (minLat + maxLat) / 2;

  // Simple heuristic for zoom based on region size
  const lonDiff = maxLon - minLon;
  const latDiff = maxLat - minLat;
  const maxDiff = Math.max(lonDiff, latDiff);

  let zoom = 7;
  if (maxDiff > 8) zoom = 5.9;       // Germany wide
  else if (maxDiff > 4) zoom = 7;  // Bavaria
  else zoom = 7;                   // smaller regions

  return {
    longitude,
    latitude,
    zoom,
    minZoom: 5,
    maxZoom: 12,
  };
};