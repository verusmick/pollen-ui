const isServer = typeof window === 'undefined';

const BASE_URL = '/api';

export async function getForecastByCoords(params: {
  from: number;
  to: number;
  pollen: string;
  lon?: number;
  lat?: number;
}) {
  const { from, to, pollen, lon = 0, lat = 0 } = params;
  const url = `${BASE_URL}/forecast?from=${from}&to=${to}&pollen=${pollen}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Forecast API error: ${res.statusText}`);
  }
  return res.json();
}
// export async function getForecastWithIntervals(params: {
//   from: number;
//   to: number;
//   pollen: string;
//   intervals: string;
// }) {
//   const { from, to, pollen, intervals } = params;
//   const url = `${BASE_URL}/forecast?from=${from}&to=${to}&pollen=${pollen}&intervals=${intervals}`;
//   const res = await fetch(url);

//   if (!res.ok) {
//     throw new Error(`Forecast API error: ${res.statusText}`);
//   }

//   return res.json();
// }

export async function getLongitudes() {
  const url = `${BASE_URL}/longitudes`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Forecast API error: ${res.statusText}`);
  }
  return res.json();
}

export async function getLatitudes() {
  const url = `${BASE_URL}/latitudes`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Forecast API error: ${res.statusText}`);
  }
  return res.json();
}

// export async function getHourlyForecast(params: {
//   date: string;
//   hour: number;
//   pollen: string;
//   box: string;
//   intervals: string;
// }) {
//   const { date, hour, pollen, box, intervals } = params;

//   const url = `/api/forecast/hour?date=${date}&hour=${hour}&pollen=${pollen}&box=${encodeURIComponent(
//     box
//   )}&intervals=${encodeURIComponent(intervals)}`;

//   const res = await fetch(url);
//   if (!res.ok) {
//     throw new Error(`Forecast Hour API error: ${res.statusText}`);
//   }
//   return res.json();
// }

export async function getHourlyForecast(params: {
  date: string;
  hour: number;
  pollen: string;
  box: string;
  intervals?: string;
  includeCoords?: boolean;
}) {
  const query = new URLSearchParams({
    date: params.date,
    hour: params.hour.toString(),
    pollen: params.pollen,
    box: params.box,
    // intervals: params.intervals,
    include_coords: (params.includeCoords || false).toString(),
  });

  const res = await fetch(`/api/forecast/hour?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Forecast Hour API error: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchChartData(params: {
  lat: number;
  lon: number;
  pollen: string;
  date: string;
  hour: number;
}) {
  const query = new URLSearchParams({
    date: params.date,
    hour: params.hour.toString(),
    pollen: params.pollen,
    lon: params.lon.toString(),
    lat: params.lat.toString(),
  });

  const res = await fetch(`/api/forecast/series?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Chart API error: ${res.statusText}`);
  }

  return res.json();
}
