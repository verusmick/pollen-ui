import { create } from 'zustand';

interface PollenDetailsChartState {
  show: boolean;
  message?: string;
  data?: Record<string, any> | null;
  latitude?: number | null;
  longitude?: number | null;

  setShow: (
    value: boolean,
    message?: string,
    data?: Record<string, any> | null,
    latitude?: number | null,
    longitude?: number | null
  ) => void;
}

export const usePollenDetailsChartStore = create<PollenDetailsChartState>(
  (set) => ({
    show: false,
    message: '',
    data: null,
    latitude: null,
    longitude: null,

    setShow: (
      value,
      message = '',
      data = null,
      latitude = null,
      longitude = null
    ) =>
      set({
        show: value,
        message,
        data,
        latitude: value ? latitude : null,
        longitude: value ? longitude : null,
      }),
  })
);
