import { getRequestConfig } from 'next-intl/server';

export const locales = ['en','es','de','fr','ar','nl'] as const;
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default
  };
});