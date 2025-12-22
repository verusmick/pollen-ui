import { create } from "zustand";

interface PartialLoadingStore {
  chartLoading: boolean;
  partialLoading: boolean;
  setChartLoading: (v: boolean) => void;
  setPartialLoading: (v: boolean) => void;
}

export const usePartialLoadingStore = create<PartialLoadingStore>((set) => ({
  chartLoading: false,
  partialLoading: false,

  setChartLoading: (v) => set({ chartLoading: v }),
  setPartialLoading: (v) => set({ partialLoading: v }),
}));
