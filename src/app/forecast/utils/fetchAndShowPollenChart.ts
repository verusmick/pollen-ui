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
  days: string;
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
  days,
  setShowPollenDetailsChart,
}: FetchChartParams) => {
  try {
    const [latitudes, longitudes] = await Promise.all([
      getLatitudes(),
      getLongitudes(),
    ]);
    const closestLat = findClosestCoordinate(lat, latitudes);
    const closestLon = findClosestCoordinate(lng, longitudes);

    const chartData = await fetchChartData({
      lat: closestLat,
      lon: closestLon,
      pollen,
      date: days,
      hour: 0,
    });

    setShowPollenDetailsChart(true, '', chartData.data, closestLat, closestLon);
  } catch (error) {
    console.error('Error loading chart data:', error);
    throw error;
  }
};
