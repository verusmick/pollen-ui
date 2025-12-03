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
