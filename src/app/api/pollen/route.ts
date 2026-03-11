import { NextResponse } from 'next/server';

function getPollenApiBase(): string {
  const baseUrl = process.env.POLLEN_API_BASE?.trim();

  if (!baseUrl) {
    throw new Error('POLLEN_API_BASE is not configured.');
  }

  return baseUrl.replace(/\/$/, '');
}

export async function GET() {
  const response = await fetch(`${getPollenApiBase()}/api/pollen`);
  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}
