import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchLocationState {
  lat: number | null;
  lng: number | null;
  name: string | null;
  setLocation: (loc: { lat: number; lng: number; name: string }) => void;
  clearLocation: () => void;
}
export const useSearchLocationStore = create<SearchLocationState>()(
  persist(
    (set) => ({
      lat: null,
      lng: null,
      name: null,
      setLocation: (loc) => set({ lat: loc.lat, lng: loc.lng, name: loc.name }),
      clearLocation: () => set({ lat: null, lng: null, name: null }),
    }),
    {
      name: "search-location", // key en localStorage
    }
  )
);
