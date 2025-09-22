import { NextResponse } from 'next/server';

const BASE_URL = 'http://forecast.enjambre.com.bo/api';

export async function GET() {
  const res = await fetch(`${BASE_URL}/longitudes`);

  if (!res.ok) {
    return NextResponse.json(
      { error: `Failed to fetch longitudes: ${res.statusText}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
