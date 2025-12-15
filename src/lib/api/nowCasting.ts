const BASE_URL = '/api/now-casting';

export async function getNowCastingByCoords(params: {
  date: string;
  hour: string;
  pollen: string;
  include_coords?: boolean;
  box?: string;
  intervals?: string;
}) {
  const { date, hour, pollen, include_coords, box, intervals } = params;

  const url = new URL(BASE_URL, window.location.origin);
  url.searchParams.set('date', date);
  url.searchParams.set('hour', hour);
  url.searchParams.set('pollen', pollen);

  if (include_coords) {
    url.searchParams.set('include_coords', 'true');
  }

  if (box) {
    url.searchParams.set('box', box);
  }
  if (intervals) {
    url.searchParams.set('intervals', intervals);
  }
  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Error fetching nowcasting: ${res.statusText}`);
  }

  return res.json();
}

export async function getHourlyNowCasting(params: {
  date: string;
  hour: number;
  pollen: string;
  box?: string;
  intervals?: string;
  includeCoords?: boolean;
  res?: number;
}) {
  const queryParams: Record<string, string> = {
    date: params.date,
    hour: params.hour.toString(),
    pollen: params.pollen,
    include_coords: (params.includeCoords || false).toString(),
    // res: (params.res ?? 2).toString(),
  };

  if (params.box !== undefined) {
    queryParams.box = params.box;
  }

  if (params.intervals !== undefined) {
    queryParams.intervals = params.intervals;
  }

  const query = new URLSearchParams(queryParams);

  const res = await fetch(`/api/nowcasting/hour?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Forecast Hour API error: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchChartDataNowCasting(params: {
  date: string;
  hour: number;
  pollen: string;
  lon: number;
  lat: number;
  nhours: number;
  signal?: AbortSignal;
}) {
  const query = new URLSearchParams({
    date: params.date,
    hour: params.hour.toString(),
    pollen: params.pollen,
    lon: params.lon.toString(),
    lat: params.lat.toString(),
    nhours: params.nhours.toString(),
  });

  const res = await fetch(`/api/nowcasting/series?${query.toString()}`, {
    signal: params.signal,
  });

  if (!res.ok) {
    throw new Error(`Chart API error: ${res.statusText}`);
  }

  return res.json();
}
