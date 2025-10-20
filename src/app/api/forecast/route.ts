import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_FORECAST_API;

export async function GET(req: NextRequest) {
  const urlObj = new URL(req.url);

  // Forward request to external API
  const forwardUrl = `${BASE_URL}/forecast?${urlObj.searchParams.toString()}`;
  const res = await fetch(forwardUrl);

  if (!res.ok) {
    return NextResponse.json(
      { error: `Failed to fetch forecast: ${res.statusText}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
