import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'es', 'de', 'fr', 'ar', 'nl'] as const;
export const defaultLocale = 'en';

export const { Link, useRouter, usePathname, redirect } =
  createNavigation({
    locales,
    defaultLocale
  });