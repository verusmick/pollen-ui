import { MAP_LEVEL_COLORS } from "@/app/constants";
import { PollenLevel } from "@/app/types";
import { getDefaultBaseDate } from "@/app/utils";


export const POLLENS = {
  ALNUS: {
    apiKey: 'POLLEN_ALNUS' as const,
    label: 'Alnus' as const,
    defaultBaseDate: getDefaultBaseDate('2025-03-10'),
    defaultHour: 15,
    apiIntervals: '1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9',
    levels: [
      { label: 'Very Low', min: 1, max: 30 },
      { label: 'Low', min: 31, max: 100 },
      { label: 'Moderate', min: 101, max: 200 },
      { label: 'High', min: 201, max: 400 },
      { label: 'Very High', min: 401, max: 1000 },
    ] as PollenLevel[],
  },
  PINACEAE: {
    apiKey: 'POLLEN_PINACEAE' as const,
    label: 'Pine' as const,
    defaultBaseDate: getDefaultBaseDate('2025-05-11'),
    defaultHour: 12,
    apiIntervals: '1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9',
    levels: [
      { label: 'Very Low', min: 1, max: 30 },
      { label: 'Low', min: 31, max: 100 },
      { label: 'Moderate', min: 101, max: 200 },
      { label: 'High', min: 201, max: 400 },
      { label: 'Very High', min: 401, max: 1000 },
    ] as PollenLevel[],
  }
} as const;

// Helper arrays for different use cases
export const POLLEN_OPTIONS = Object.values(POLLENS).map(
  (pollen) => pollen.label
);
export const POLLEN_API_KEYS = Object.values(POLLENS).map(
  (pollen) => pollen.apiKey
);
export const POLLEN_ENTRIES = Object.entries(POLLENS).map(([key, value]) => ({
  key: key as PollenKey,
  ...value,
}));
export const getPollenByApiKey = (apiKey: PollenApiKey) => {
  return Object.values(POLLENS).find((p) => p.apiKey === apiKey);
};
export const getLevelsForLegend = (pollenApiKey: PollenApiKey) => {
  const pollen = Object.values(POLLENS).find((p) => p.apiKey === pollenApiKey);
  if (!pollen) return [];

  return pollen.levels.map((level, idx, arr) => {
    const key = level.label
      .toLowerCase()
      .replace(/\s+/g, '_') as keyof typeof MAP_LEVEL_COLORS;

    let maxLabel = level.max.toString();

    if (idx === arr.length - 1) {
      maxLabel = `>${level.max}`;
    }

    return {
      key,
      color: MAP_LEVEL_COLORS[key],
      min: level.min,
      max: maxLabel,
      label: level.label,
    };
  });
};
// Types
export type PollenKey = keyof typeof POLLENS;
export type PollenApiKey = (typeof POLLENS)[PollenKey]['apiKey'];
export type PollenLabel = (typeof POLLENS)[PollenKey]['label'];
export type PollenConfig = (typeof POLLENS)[PollenKey];

// Defaults
export const DEFAULT_POLLEN_KEY: PollenKey = 'ALNUS';
export const DEFAULT_POLLEN = POLLENS[DEFAULT_POLLEN_KEY];
export const DEFAULT_POLLEN_API_KEY = DEFAULT_POLLEN.apiKey;