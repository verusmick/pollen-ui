import { BIRCH_CONFIG, LEVEL_COLORS } from './pollen';

export const POLLEN_ALNUS = {
  ...BIRCH_CONFIG,
  apiKey: 'POLLEN_ALNUS' as const,
  label: 'Alnus' as const,
};

export const NOWCASTING_POLLENS = {
  ALNUS: POLLEN_ALNUS,
};

export type NowCastingPollenConfig = typeof POLLEN_ALNUS;
export const getNowCastingLevelsForLegend = (
  pollen: NowCastingPollenConfig
) => {
  return pollen.levels.map((level, idx, arr) => {
    const key = level.label
      .toLowerCase()
      .replace(/\s+/g, '_') as keyof typeof LEVEL_COLORS;

    let maxLabel = level.max.toString();
    if (idx === arr.length - 1) maxLabel = `>${level.max}`;

    return {
      key,
      color: LEVEL_COLORS[key],
      min: level.min,
      max: maxLabel,
      label: level.label,
    };
  });
};
