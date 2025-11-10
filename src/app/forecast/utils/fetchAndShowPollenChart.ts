import dayjs from 'dayjs';
import {
  getLatitudes,
  getLongitudes,
  fetchChartData,
} from '@/lib/api/forecast';
import { findClosestCoordinate } from './findClosestCoordinate';

interface FetchChartParams {
  lat: number;
  lng: number;
  pollen: string;
  date: string; // ← fecha base que le pasas (ej. "2025-11-10")
  setShowPollenDetailsChart: (
    show: boolean,
    title?: string,
    data?: any,
    lat?: number,
    lon?: number
  ) => void;
}

export const fetchAndShowPollenChart = async ({
  lat,
  lng,
  pollen,
  date,
  setShowPollenDetailsChart,
}: FetchChartParams) => {
  try {
    const [latitudes, longitudes] = await Promise.all([
      getLatitudes(),
      getLongitudes(),
    ]);

    const closestLat = findClosestCoordinate(lat, latitudes);
    const closestLon = findClosestCoordinate(lng, longitudes);
    
    const futureDate = dayjs(date).add(2, 'day').format('YYYY-MM-DD');

    const chartData = await fetchChartData({
      lat: closestLat,
      lon: closestLon,
      pollen,
      date: futureDate,
      hour: 0,
    });

    setShowPollenDetailsChart(true, '', chartData.data, closestLat, closestLon);
  } catch (error) {
    console.error('Error loading chart data:', error);
    throw error;
  }
};
