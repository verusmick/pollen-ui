'use client';

import { useThemeStore } from '@/app/stores';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Theme } from '@/app/stores';

const lightThemeRoutes = [
  '/alerts-and-correction-factors',
  '/rules-and-notifications',
];

function getPathWithoutLocale(pathname: string) {
  return pathname.replace(/^\/(en|es|de|fr|ar|nl)(?=\/|$)/, '') || '/';
}

function shouldUseLightTheme(pathname: string) {
  const normalizedPath = getPathWithoutLocale(pathname);

  return lightThemeRoutes.some(
    (route) =>
      normalizedPath === route || normalizedPath.startsWith(`${route}/`)
  );
}

export function ThemeBridge() {
  const setTheme = useThemeStore((s) => s.setTheme);
  const pathname = usePathname();

  useEffect(() => {
    const routeTheme: Theme = shouldUseLightTheme(pathname) ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', routeTheme === 'dark');
    setTheme(routeTheme);
  }, [pathname, setTheme]);

  return null;
}
