export const COLORS = {
  gray: '#9CA3AF',
  white: '#FFFFFF',
  blue: '#2b7fff',
} as const;

export type ColorKey = keyof typeof COLORS;
export type ColorValue = (typeof COLORS)[ColorKey];
