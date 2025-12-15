import { useCallback, useRef } from 'react';
import dayjs from 'dayjs';

import { fetchChartData } from '@/lib/api/forecast';
import { fetchChartDataNowCasting } from '@/lib/api/nowCasting';
import { useCoordinatesStore, usePartialLoadingStore } from '@/app/stores';
import { usePollenDetailsChartStore } from '@/app/forecast/stores';
import { findClosestCoordinate } from '@/app/forecast/utils';

interface ForecastParams {
  hour: number;
}

interface NowCastingParams {
  hour: number;
  nhours: number;
}

interface FetchParams {
  lat: number;
  lng: number;
  pollen: string;
  date: string;
  forecast?: ForecastParams;
  nowcasting?: NowCastingParams;
}

export const usePollenChart = () => {
  const { setShow } = usePollenDetailsChartStore();
  const { setChartLoading } = usePartialLoadingStore();

  const lastRequestId = useRef('');
  const lastController = useRef<AbortController | null>(null);

  const fetchChart = useCallback(
    async (params: FetchParams) => {
      const {
        lat,
        lng,
        pollen,
        date,
        forecast: forecastParam,
        nowcasting: nowcastingParam,
      } = params;
      const { forecast, nowCasting } = useCoordinatesStore.getState();
      const forecastLats = forecast.latitudes;
      const forecastLons = forecast.longitudes;
      const nowCastingLats = nowCasting.latitudes;
      const nowCastingLons = nowCasting.longitudes;

      const requestId = `${lat}-${lng}-${Date.now()}`;
      lastRequestId.current = requestId;

      if (lastController.current) {
        lastController.current.abort();
      }

      const controller = new AbortController();
      lastController.current = controller;

      setChartLoading(true);

      try {
        let finalLat = lat;
        let finalLon = lng;

        if (forecastParam && forecastLats.length && forecastLons.length) {
          finalLat = findClosestCoordinate(lat, forecastLats);
          finalLon = findClosestCoordinate(lng, forecastLons);
        } else if (
          nowcastingParam &&
          nowCastingLats.length &&
          nowCastingLons.length
        ) {
          finalLat = findClosestCoordinate(lat, nowCastingLats);
          finalLon = findClosestCoordinate(lng, nowCastingLons);
        }

        let chartResponse = null;

        if (forecastParam) {
          const futureDate = dayjs(date).add(2, 'day').format('YYYY-MM-DD');

          chartResponse = await fetchChartData({
            lat: finalLat,
            lon: finalLon,
            pollen,
            date: futureDate,
            hour: forecastParam.hour,
            signal: controller.signal,
          });
        } else if (nowcastingParam) {
          chartResponse = await fetchChartDataNowCasting({
            lat: finalLat,
            lon: finalLon,
            pollen,
            date,
            hour: nowcastingParam.hour,
            nhours: nowcastingParam.nhours,
            signal: controller.signal,
          });
        }

        if (lastRequestId.current !== requestId) return;

        setShow(true, '', chartResponse?.data ?? null, lat, lng);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('usePollenChart error:', err);
      } finally {
        if (lastRequestId.current === requestId) {
          setChartLoading(false);
        }
      }
    },
    [setShow, setChartLoading]
  );

  return { fetchChart };
};

export default usePollenChart;
