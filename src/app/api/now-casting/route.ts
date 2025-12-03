import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.SILAM_API_BASE!;
const USER = process.env.SILAM_USER!;
const PASS = process.env.SILAM_PASS!;

export async function GET(req: NextRequest) {
  const urlObj = new URL(req.url);
  const query = urlObj.searchParams.toString();

  const forwardUrl = `${BASE_URL}/nowcasting/hour?${query}`;

  const res = await fetch(forwardUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${USER}:${PASS}`).toString(
        'base64'
      )}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Failed to fetch hourly forecast: ${res.statusText}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
