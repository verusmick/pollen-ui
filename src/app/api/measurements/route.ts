import { NextRequest, NextResponse } from 'next/server';

function getPollenApiBase(): string {
  const baseUrl = process.env.POLLEN_API_BASE?.trim();

  if (!baseUrl) {
    throw new Error('POLLEN_API_BASE is not configured.');
  }

  return baseUrl.replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.toString();
  const forwardUrl = `${getPollenApiBase()}/api/measurements${
    query ? `?${query}` : ''
  }`;

  const response = await fetch(forwardUrl);
  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}
