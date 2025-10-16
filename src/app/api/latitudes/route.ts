import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_FORECAST_API;

export async function GET() {
  const res = await fetch(`${BASE_URL}/latitudes`);

  if (!res.ok) {
    return NextResponse.json(
      { error: `Failed to fetch latitudes: ${res.statusText}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
