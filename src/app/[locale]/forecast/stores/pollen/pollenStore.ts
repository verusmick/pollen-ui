import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PollenState {
  selectedPollen: string;
  setSelectedPollen: (value: string) => void;
}

export const usePollenStore = create<PollenState>()(
  persist(
    (set) => ({
      selectedPollen: "",
      setSelectedPollen: (value) => set({ selectedPollen: value }),
    }),
    {
      name: "pollen-storage",
    }
  )
);
