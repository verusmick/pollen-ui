import { create } from 'zustand';

interface Location {
  boundingbox: number[];
  lat: number;
  lng: number;
  name: string;
  place_id?: string;
}

interface SearchLocationState {
  location: Location | null;
  setLocation: (loc: Location) => void;
  clearLocation: () => void;
}

export const useSearchLocationStore = create<SearchLocationState>((set) => ({
  location: null,
  setLocation: (loc: Location) => set({ location: loc }),
  clearLocation: () => set({ location: null }),
}));
