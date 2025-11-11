import dayjs from 'dayjs';
import { fetchChartData } from '@/lib/api/forecast';
import { findClosestCoordinate } from './findClosestCoordinate';
import { useCoordinatesStore } from '@/app/forecast/stores'; // store global

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
}

export const fetchAndShowPollenChart = async ({
  lat,
  lng,
  pollen,
  date,
  setShowPollenDetailsChart,
}: FetchChartParams) => {
  try {
    const { latitudes, longitudes } = useCoordinatesStore.getState();

    if (!latitudes.length || !longitudes.length) {
      console.warn('Coordinates not yet available in the store');
      return;
    }

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
    console.error('Error loading chart data', error);
    throw error;
  }
};
