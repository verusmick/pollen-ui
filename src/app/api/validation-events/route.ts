import { NextRequest, NextResponse } from 'next/server';

function getValidationApiBase(): string {
  const baseUrl = process.env.POLLEN_VALIDATION_API_BASE?.trim();

  if (!baseUrl) {
    throw new Error('POLLEN_VALIDATION_API_BASE is not configured.');
  }

  return baseUrl.replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.toString();

  if (!query) {
    return NextResponse.json(
      { message: 'Validation events query parameter is required.' },
      { status: 400 }
    );
  }

  const forwardUrl = `${getValidationApiBase()}/resources/q?${query}`;

  const response = await fetch(forwardUrl, {
    cache: 'no-store',
  });
  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}
