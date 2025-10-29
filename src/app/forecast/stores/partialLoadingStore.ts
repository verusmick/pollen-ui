import { create } from "zustand";

interface PartialLoadingStore {
  isLoading: boolean;
  setPartialLoading: (value: boolean) => void;
}

export const usePartialLoadingStore = create<PartialLoadingStore>((set) => ({
  isLoading: false,
  setPartialLoading: (value) => set({ isLoading: value }),
}));
