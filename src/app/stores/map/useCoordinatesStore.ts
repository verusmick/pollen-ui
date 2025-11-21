import { create } from 'zustand';

interface CoordinatesState {
  latitudes: number[];
  longitudes: number[];
  setLatitudes: (lats: number[]) => void;
  setLongitudes: (longs: number[]) => void;
  reset: () => void;
}

export const useCoordinatesStore = create<CoordinatesState>((set) => ({
  latitudes: [],
  longitudes: [],
  setLatitudes: (lats) => set({ latitudes: lats }),
  setLongitudes: (longs) => set({ longitudes: longs }),
  reset: () => set({ latitudes: [], longitudes: [] }),
}));
