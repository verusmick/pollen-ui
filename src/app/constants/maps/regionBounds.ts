
export const REGION_BOUNDS: Record<string, [number, number, number, number]> = {
  BAVARIA: [7.7893676757813735, 46.51390491298438, 15.210632324218798, 50.986455071208994],
  GERMANY: [5.866, 47.270, 15.043, 55.059]
};
// Helper to get current region's bounding box
export const getRegionBounds = () => {
  const region = process.env.NEXT_PUBLIC_REGION;
  if (!region) return REGION_BOUNDS.BAVARIA;
  const key = region.toUpperCase();
  if (!REGION_BOUNDS[key]) return REGION_BOUNDS.GERMANY;
  return REGION_BOUNDS[key];
};
