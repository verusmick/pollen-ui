import { create } from "zustand";

interface LoadingState {
  loading: boolean;
  message: string;
  setLoading: (value: boolean, message?: string) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  loading: true,
  message: "Loading",
  setLoading: (value, message) =>
    set({ loading: value, message: message ?? "Loading" }),
}));
