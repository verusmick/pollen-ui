export type RuntimeMode = 'embedded' | 'standalone';

export function detectRuntime(): RuntimeMode {
  if (typeof window === 'undefined') return 'standalone';

  try {
    return window.parent !== window ? 'embedded' : 'standalone';
  } catch {
    // cross-origin safety
    return 'standalone';
  }
}