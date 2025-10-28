import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://berlin.silam.pollenscience.eu/api/api';

// Use environment variables instead of hardcoding credentials
const USER = process.env.SILAM_USER!;
const PASS = process.env.SILAM_PASS!;

export async function GET(req: NextRequest) {
  const urlObj = new URL(req.url);
  const query = urlObj.searchParams.toString();

  const forwardUrl = `${BASE_URL}/forecast?${query}`;

  const res = await fetch(forwardUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${USER}:${PASS}`).toString('base64')}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Failed to fetch forecast: ${res.statusText}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
