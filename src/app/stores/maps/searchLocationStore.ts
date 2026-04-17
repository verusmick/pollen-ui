import { create } from "zustand";

interface SearchLocationState {
  boundingbox: Array<number>;
  lat: number | null;
  lng: number | null;
  name: string | null;
  setLocation: (loc: { boundingbox: Array<number>; lat: number; lng: number; name: string }) => void;
  clearLocation: () => void;
}

export const useSearchLocationStore = create<SearchLocationState>((set) => ({
  boundingbox: [],
  lat: null,
  lng: null,
  name: null,
  setLocation: (loc) =>
    set({
      boundingbox: loc.boundingbox,
      lat: loc.lat,
      lng: loc.lng,
      name: loc.name,
    }),
  clearLocation: () => set({ boundingbox: [], lat: null, lng: null, name: null }),
}));
