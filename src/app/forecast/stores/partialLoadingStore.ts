import { create } from "zustand";

interface PartialLoadingStore {
  isLoading: boolean;
  setLoading: (value: boolean) => void;
}

export const usePartialLoadingStore = create<PartialLoadingStore>((set) => ({
  isLoading: false,
  setLoading: (value) => set({ isLoading: value }),
}));
