export const POLLENS = {
  BIRCH: {
    apiKey: 'POLLEN_BIRCH' as const,
    label: 'Birch' as const,
  },
  GRASS: {
    apiKey: 'POLLEN_GRASS' as const,
    label: 'Grass' as const,
  },
  ALDER: {
    apiKey: 'POLLEN_ALDER' as const,
    label: 'Alder' as const,
  },
} as const;

// Helper arrays for different use cases
export const POLLEN_OPTIONS = Object.values(POLLENS).map(pollen => pollen.label);
export const POLLEN_API_KEYS = Object.values(POLLENS).map(pollen => pollen.apiKey);
export const POLLEN_ENTRIES = Object.entries(POLLENS).map(([key, value]) => ({
  key: key as PollenKey,
  ...value
}));

// Types
export type PollenKey = keyof typeof POLLENS;
export type PollenApiKey = typeof POLLENS[PollenKey]['apiKey'];
export type PollenLabel = typeof POLLENS[PollenKey]['label'];
export type PollenConfig = typeof POLLENS[PollenKey];

// Defaults
export const DEFAULT_POLLEN_KEY: PollenKey = 'BIRCH';
export const DEFAULT_POLLEN = POLLENS[DEFAULT_POLLEN_KEY];
export const DEFAULT_POLLEN_API_KEY = DEFAULT_POLLEN.apiKey;