import {NextResponse} from 'next/server';

const BASE_URL = 'http://forecast.enjambre.com.bo/api/forecast';

export async function GET(req: Request) {
  const {searchParams} = new URL(req.url);

  // server-side fetch: HTTP is allowed here
  const url = `${BASE_URL}?${searchParams.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    return NextResponse.json({error: 'Failed to fetch forecast'}, {status: res.status});
  }

  const data = await res.json();
  return NextResponse.json(data);
}