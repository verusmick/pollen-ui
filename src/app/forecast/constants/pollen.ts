import dayjs from 'dayjs';

type PollenLevel = { label: string; min: number; max: number };

const USE_CURRENT_DATE = process.env.NEXT_PUBLIC_USE_CURRENT_DATE === 'true';

const getDefaultBaseDate = (fallbackDate: string) =>
  USE_CURRENT_DATE ? dayjs().format('YYYY-MM-DD') : fallbackDate;

export const LEVEL_COLORS = {
  none: '#fff',
  very_low: '#00e838',
  low: '#a5eb02',
  moderate: '#ebbb02',
  high: '#f27200',
  very_high: '#ff0000',
} as const;

export const POLLENS = {
  BIRCH: {
    apiKey: 'POLLEN_BIRCH' as const,
    label: 'Birch' as const,
    defaultBaseDate: getDefaultBaseDate('2022-04-14'),
    apiIntervals: '1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9',
    levels: [
      { label: 'Very Low', min: 1, max: 30 },
      { label: 'Low', min: 31, max: 100 },
      { label: 'Moderate', min: 101, max: 200 },
      { label: 'High', min: 201, max: 400 },
      { label: 'Very High', min: 401, max: 1000 },
    ] as PollenLevel[],
  },
  GRASS: {
    apiKey: 'POLLEN_GRASS' as const,
    label: 'Grass' as const,
    defaultBaseDate: getDefaultBaseDate('2023-06-01'),
    apiIntervals: '1,15,2,16,50,4,51,100,6,101,200,8,201,1000,9',
    levels: [
      { label: 'Very Low', min: 1, max: 15 },
      { label: 'Low', min: 16, max: 50 },
      { label: 'Moderate', min: 51, max: 100 },
      { label: 'High', min: 101, max: 200 },
      { label: 'Very High', min: 201, max: 1000 },
    ] as PollenLevel[],
  },
  ALDER: {
    apiKey: 'POLLEN_ALDER' as const,
    label: 'Alder' as const,
    defaultBaseDate: getDefaultBaseDate('2024-02-14'),
    apiIntervals: '1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9',
    levels: [
      { label: 'Very Low', min: 1, max: 30 },
      { label: 'Low', min: 31, max: 100 },
      { label: 'Moderate', min: 101, max: 200 },
      { label: 'High', min: 201, max: 400 },
      { label: 'Very High', min: 401, max: 1000 },
    ] as PollenLevel[],
  },
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
      .replace(/\s+/g, '_') as keyof typeof LEVEL_COLORS;

    let maxLabel = level.max.toString();

    if (idx === arr.length - 1) {
      maxLabel = `>${level.max}`;
    }

    return {
      key,
      color: LEVEL_COLORS[key],
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
export const DEFAULT_POLLEN_KEY: PollenKey = 'BIRCH';
export const DEFAULT_POLLEN = POLLENS[DEFAULT_POLLEN_KEY];
export const DEFAULT_POLLEN_API_KEY = DEFAULT_POLLEN.apiKey;
