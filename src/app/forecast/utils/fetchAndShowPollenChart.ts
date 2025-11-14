import dayjs from 'dayjs';
import { fetchChartData } from '@/lib/api/forecast';
import { findClosestCoordinate } from './findClosestCoordinate';
import {
  useCoordinatesStore,
  usePollenDetailsChartStore,
} from '@/app/forecast/stores';

interface FetchChartParams {
  lat: number;
  lng: number;
  pollen: string;
  date: string;
  setShowPollenDetailsChart: (
    show: boolean,
    title?: string,
    data?: any,
    lat?: number,
    lon?: number
  ) => void;
  signal?: AbortSignal;
  requestId?: string;
}

let lastRequestId = '';
let lastController: AbortController | null = null;

export const fetchAndShowPollenChart = async ({
  lat,
  lng,
  pollen,
  date,
  setShowPollenDetailsChart,
  requestId,
}: FetchChartParams) => {
  try {
    const { latitudes, longitudes } = useCoordinatesStore.getState();
    if (!latitudes.length || !longitudes.length) {
      console.warn('Coordinates not yet available in the store');
      return;
    }
    const currentRequestId = requestId || `${lat}-${lng}-${Date.now()}`;
    lastRequestId = currentRequestId;

    if (lastController) {
      lastController.abort();
    }
    const controller = new AbortController();
    lastController = controller;

    const closestLat = findClosestCoordinate(lat, latitudes);
    const closestLon = findClosestCoordinate(lng, longitudes);
    const futureDate = dayjs(date).add(2, 'day').format('YYYY-MM-DD');

    const chartData = await fetchChartData({
      lat: closestLat,
      lon: closestLon,
      pollen,
      date: futureDate,
      hour: 0,
      signal: controller.signal,
    });

    if (lastRequestId !== currentRequestId) {
      return;
    }

    const { show } = usePollenDetailsChartStore.getState();
    if (!show) return;

    setShowPollenDetailsChart(true, '', chartData.data, closestLat, closestLon);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return;
    }
    console.error('Error loading chart data', error);
    throw error;
  }
};
