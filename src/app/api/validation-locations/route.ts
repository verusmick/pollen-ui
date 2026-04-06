import { NextResponse } from 'next/server';

function getValidationApiBase(): string {
  const baseUrl = process.env.POLLEN_VALIDATION_API_BASE?.trim();

  if (!baseUrl) {
    throw new Error('POLLEN_VALIDATION_API_BASE is not configured.');
  }

  return baseUrl.replace(/\/$/, '');
}

export async function GET() {
  const response = await fetch(`${getValidationApiBase()}/resources/locations`, {
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
