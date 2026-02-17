import bavariaGeo from '@/data/bavaria.geo.json';
import germanyGeo from '@/data/germany.geo.json';

const REGION_GEO: Record<string, any> = {
  BAVARIA: bavariaGeo,
  GERMANY: germanyGeo,
};

export const getRegionGeo = () => {
  const region = process.env.NEXT_PUBLIC_REGION?.toUpperCase();

  if (!region || !REGION_GEO[region]) {
    return bavariaGeo;
  }

  return REGION_GEO[region];
};