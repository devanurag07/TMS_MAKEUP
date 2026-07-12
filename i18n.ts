import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['ar', 'de', 'en', 'es', 'fr', 'hi', 'it'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // Ensure the locale is valid
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
