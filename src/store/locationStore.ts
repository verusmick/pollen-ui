import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
  lat: number | null;
  lng: number | null;
  setLocation: (coords: { lat: number; lng: number }) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      lat: null,
      lng: null,
      setLocation: (coords) => set({ lat: coords.lat, lng: coords.lng }),
      clearLocation: () => set({ lat: null, lng: null }),
    }),
    {
      name: "current-location",
    }
  )
);
