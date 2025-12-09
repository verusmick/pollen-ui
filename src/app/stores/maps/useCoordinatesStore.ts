import { create } from 'zustand';

interface CoordinatesState {
  latitudes: number[];
  longitudes: number[];
  userLocation: { lat: number; lng: number } | null;

  setLatitudes: (lats: number[]) => void;
  setLongitudes: (longs: number[]) => void;
  setUserLocation: (coords: { lat: number; lng: number }) => void;

  reset: () => void;
}

export const useCoordinatesStore = create<CoordinatesState>((set) => ({
  latitudes: [],
  longitudes: [],
  userLocation: null,

  setLatitudes: (lats) => set({ latitudes: lats }),
  setLongitudes: (longs) => set({ longitudes: longs }),
  setUserLocation: (coords) => set({ userLocation: coords }),

  reset: () => set({ latitudes: [], longitudes: [], userLocation: null }),
}));
