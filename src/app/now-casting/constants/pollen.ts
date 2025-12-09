import { MAP_LEVEL_COLORS } from "@/app/constants";
import { PollenLevel } from "@/app/types";
import { getDefaultBaseDate } from "@/app/utils";

export const POLLENS = {
  ALNUS: {
    apiKey: 'POLLEN_ALNUS' as const,
    label: 'Alder (Alnus)' as const,
    defaultBaseDate: getDefaultBaseDate('2025-03-10'),
    defaultHour: 15,
    apiIntervals: '1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9',
    levels: [
      { label: 'Very Low', min: 1, max: 30 },
      { label: 'Low', min: 31, max: 100 },
      { label: 'Moderate', min: 101, max: 200 },
      { label: 'High', min: 201, max: 400 },
      { label: 'Very High', min: 401, max: 1000 },
    ] as PollenLevel[]
  },
  // todo: take a look with the client
  PINACEAE: {
    apiKey: 'POLLEN_PINACEAE' as const,
    label: 'Pine (Pinaceae)' as const,
    defaultBaseDate: getDefaultBaseDate('2025-05-11'),
    defaultHour: 12,
    apiIntervals: '1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9',
    levels: [
      { label: 'Very Low', min: 1, max: 30 },
      { label: 'Low', min: 31, max: 100 },
      { label: 'Moderate', min: 101, max: 200 },
      { label: 'High', min: 201, max: 400 },
      { label: 'Very High', min: 401, max: 1000 },
    ] as PollenLevel[]
  },
  BETULA: {
    apiKey: 'POLLEN_BETULA' as const,
    label: 'Birch (Betula)' as const,
    defaultBaseDate: getDefaultBaseDate('2025-05-11'),
    defaultHour: 12,
    apiIntervals: '1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9',
    levels: [
      { label: 'Very Low', min: 1, max: 30 },
      { label: 'Low', min: 31, max: 100 },
      { label: 'Moderate', min: 101, max: 200 },
      { label: 'High', min: 201, max: 400 },
      { label: 'Very High', min: 401, max: 1000 },
    ] as PollenLevel[]
  },
  CORYLUS: {
    apiKey: 'POLLEN_CORYLUS' as const,
    label: 'Hazel (Corylus)' as const,
    defaultBaseDate: getDefaultBaseDate('2025-05-11'),
    defaultHour: 12,
    apiIntervals: '1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9',
    levels: [
      { label: 'Very Low', min: 1, max: 30 },
      { label: 'Low', min: 31, max: 100 },
      { label: 'Moderate', min: 101, max: 200 },
      { label: 'High', min: 201, max: 400 },
      { label: 'Very High', min: 401, max: 1000 },
    ] as PollenLevel[]
  },
  FRAXINUS: {
    apiKey: 'POLLEN_FRAXINUS' as const,
    label: 'Ash (Fraxinus)' as const,
    defaultBaseDate: getDefaultBaseDate('2025-05-11'),
    defaultHour: 12,
    apiIntervals: '1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9',
    levels: [
      { label: 'Very Low', min: 1, max: 30 },
      { label: 'Low', min: 31, max: 100 },
      { label: 'Moderate', min: 101, max: 200 },
      { label: 'High', min: 201, max: 400 },
      { label: 'Very High', min: 401, max: 1000 },
    ] as PollenLevel[]
  },
  // todo: take a look with the client
  PINUS: {
    apiKey: 'POLLEN_PINUS' as const,
    label: 'Pine (Pinus)' as const,
    defaultBaseDate: getDefaultBaseDate('2025-05-11'),
    defaultHour: 12,
    apiIntervals: '0,1500,0',
    levels: [
      { label: 'None', min: 0, max: 1500 },
    ] as PollenLevel[],
  },
  POACEAE: {
    apiKey: 'POLLEN_POACEAE' as const,
    label: 'Grasses (Poaceae)' as const,
    defaultBaseDate: getDefaultBaseDate('2025-05-11'),
    defaultHour: 12,
    apiIntervals: '1,15,2,16,50,4,51,100,6,101,200,8,201,1000,9',
    levels: [
      { label: 'Very Low', min: 1, max: 15 },
      { label: 'Low', min: 16, max: 50 },
      { label: 'Moderate', min: 51, max: 100 },
      { label: 'High', min: 101, max: 200 },
      { label: 'Very High', min: 201, max: 1000 },
    ] as PollenLevel[],
  },
  QUERCUS: {
    apiKey: 'POLLEN_QUERCUS' as const,
    label: 'Oak (Quercus)' as const,
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
  },
  URTICA: {
    apiKey: 'POLLEN_URTICA' as const,
    label: 'Nettle (Urtica)' as const,
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