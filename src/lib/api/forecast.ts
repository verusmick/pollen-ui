const isServer = typeof window === 'undefined';

// Use internal proxy in production (browser-safe)
// Use external API directly in local dev (since no HTTPS restriction)
const BASE_URL = !isServer && process.env.NODE_ENV === 'development'
  ? 'http://forecast.enjambre.com.bo/api/forecast'
  : '/api/forecast';

export async function getForecastByCoords(params: {
  from: number;
  to: number;
  pollen: string;
  lon: number;
  lat: number;
}) {
  const { from, to, pollen, lon, lat } = params;

  const url = `${BASE_URL}?from=${from}&to=${to}&pollen=${pollen}&lon=${lon}&lat=${lat}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Forecast API error: ${res.statusText}`);
  }

  return res.json();
}

export async function getForecastWithIntervals(params: {
  from: number;
  to: number;
  pollen: string;
  intervals: string;
}) {
  const { from, to, pollen, intervals } = params;

  const url = `${BASE_URL}?from=${from}&to=${to}&pollen=${pollen}&intervals=${intervals}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Forecast API error: ${res.statusText}`);
  }

  return res.json();
}