import { NextRequest, NextResponse } from 'next/server';

function getPollenApiBase(): string {
  const baseUrl = process.env.POLLEN_API_BASE?.trim();

  if (!baseUrl) {
    throw new Error('POLLEN_API_BASE is not configured.');
  }

  return baseUrl.replace(/\/$/, '');
}

async function forwardCollectionRequest(
  request: NextRequest,
  method: 'GET' | 'POST'
) {
  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.toString();
  const forwardUrl = `${getPollenApiBase()}/api/correctionFactors${
    query ? `?${query}` : ''
  }`;
  const body = method === 'POST' ? await request.text() : undefined;

  const response = await fetch(forwardUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function GET(request: NextRequest) {
  return forwardCollectionRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return forwardCollectionRequest(request, 'POST');
}
