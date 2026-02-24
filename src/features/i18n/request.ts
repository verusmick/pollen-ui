import { getRequestConfig } from 'next-intl/server';

export const locales = ['en','es','de','fr','ar','nl'] as const;
export const defaultLocale = 'en';

function resolveLocale(locale: unknown): string {
  if (typeof locale === 'string' && locales.includes(locale as any)) {
    return locale;
  }
  return defaultLocale;
}

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = resolveLocale(locale);

  return {
    locale: resolvedLocale,
    messages: (await import(`../../../messages/${resolvedLocale}.json`)).default
  };
});