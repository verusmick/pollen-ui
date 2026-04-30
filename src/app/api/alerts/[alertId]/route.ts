import { NextRequest, NextResponse } from 'next/server';

function getPollenApiBase(): string {
  const baseUrl = process.env.POLLEN_API_BASE?.trim();

  if (!baseUrl) {
    throw new Error('POLLEN_API_BASE is not configured.');
  }

  return baseUrl.replace(/\/$/, '');
}

async function forwardItemRequest(
  request: NextRequest,
  alertId: string,
  method: 'GET' | 'PUT' | 'DELETE'
) {
  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.toString();
  const forwardUrl = `${getPollenApiBase()}/api/alerts/${alertId}${
    query ? `?${query}` : ''
  }`;
  const body = method === 'PUT' ? await request.text() : undefined;

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ alertId: string }> }
) {
  const { alertId } = await context.params;
  return forwardItemRequest(request, alertId, 'GET');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ alertId: string }> }
) {
  const { alertId } = await context.params;
  return forwardItemRequest(request, alertId, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ alertId: string }> }
) {
  const { alertId } = await context.params;
  return forwardItemRequest(request, alertId, 'DELETE');
}
