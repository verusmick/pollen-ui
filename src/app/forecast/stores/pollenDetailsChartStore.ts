import { create } from "zustand";

interface PollenDetailsChartState {
  show: boolean;
  message?: string;
  data?: Record<string, any> | null;

  setShow: (value: boolean, message?: string, data?: Record<string, any> | null) => void;
  toggle: (message?: string, data?: Record<string, any> | null) => void;
  setData: (data: Record<string, any> | null) => void;
}

export const usePollenDetailsChartStore = create<PollenDetailsChartState>((set) => ({
  show: false,
  message: "",
  data: null,

  setShow: (value, message = "", data = null) => set({ show: value, message, data }),
  toggle: (message = "", data = null) =>
    set((s) => ({ show: !s.show, message, data })),
  setData: (data) => set({ data }),
}));
