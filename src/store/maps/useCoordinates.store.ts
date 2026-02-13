import { create } from 'zustand';

interface CoordinatesSlice {
  latitudes: number[];
  longitudes: number[];
  setLatitudes: (lats: number[]) => void;
  setLongitudes: (longs: number[]) => void;
  reset: () => void;
}

interface CoordinatesStore {
  forecast: CoordinatesSlice;
  nowCasting: CoordinatesSlice;
}

export const useCoordinatesStore = create<CoordinatesStore>((set) => ({
  forecast: {
    latitudes: [],
    longitudes: [],
    setLatitudes: (lats) =>
      set((state) => ({ forecast: { ...state.forecast, latitudes: lats } })),
    setLongitudes: (longs) =>
      set((state) => ({ forecast: { ...state.forecast, longitudes: longs } })),
    reset: () =>
      set((state) => ({
        forecast: { ...state.forecast, latitudes: [], longitudes: [] },
      })),
  },
  nowCasting: {
    latitudes: [],
    longitudes: [],
    setLatitudes: (lats) =>
      set((state) => ({
        nowCasting: { ...state.nowCasting, latitudes: lats },
      })),
    setLongitudes: (longs) =>
      set((state) => ({
        nowCasting: { ...state.nowCasting, longitudes: longs },
      })),
    reset: () =>
      set((state) => ({
        nowCasting: { ...state.nowCasting, latitudes: [], longitudes: [] },
      })),
  },
}));
