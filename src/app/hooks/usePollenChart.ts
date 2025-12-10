import { useCallback, useRef } from 'react';
import dayjs from 'dayjs';

import { fetchChartData } from '@/lib/api/forecast';
import { fetchChartDataNowCasting } from '@/lib/api/nowCasting';
import { useCoordinatesStore } from '@/app/stores';
import { usePollenDetailsChartStore } from '@/app/forecast/stores';
import { findClosestCoordinate } from '../forecast/utils';

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
  const { latitudes, longitudes } = useCoordinatesStore();
  const { setShow } = usePollenDetailsChartStore();

  const lastRequestId = useRef<string>('');
  const lastController = useRef<AbortController | null>(null);

  const fetchChart = useCallback(
    async (params: FetchParams) => {
      const { lat, lng, pollen, date, forecast, nowcasting } = params;

      try {
        if (!latitudes.length || !longitudes.length) return;

        // Handle cancellation
        const requestId = `${lat}-${lng}-${Date.now()}`;
        lastRequestId.current = requestId;

        if (lastController.current) lastController.current.abort();
        const controller = new AbortController();
        lastController.current = controller;

        // Grid coords
        const closestLat = findClosestCoordinate(lat, latitudes);
        const closestLon = findClosestCoordinate(lng, longitudes);

        let chartResponse: any = null;

        if (forecast) {
          const futureDate = dayjs(date).add(2, 'day').format('YYYY-MM-DD');

          chartResponse = await fetchChartData({
            lat: closestLat,
            lon: closestLon,
            pollen,
            date: futureDate,
            hour: forecast.hour,
            signal: controller.signal,
          });
        }

        if (nowcasting) {
          chartResponse = await fetchChartDataNowCasting({
            lat: closestLat,
            lon: closestLon,
            pollen,
            date,
            hour: nowcasting.hour,
            nhours: nowcasting.nhours,
          });
        }

        // Race condition check
        if (lastRequestId.current !== requestId) return;

        // Show chart modal
        setShow(true, '', chartResponse.data, closestLat, closestLon);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('usePollenChart error:', err);
      }
    },
    [latitudes, longitudes, setShow]
  );

  return { fetchChart };
};
