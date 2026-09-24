import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "utfs.io",
      "trymystyle-pullzone.b-cdn.net",
      "fluxv2-salon-products.s3.us-east-1.amazonaws.com",
    ],
  },
  // include brotli assets for the specific route(s) that need Chromium

  // keep these as true server externals
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],

  // 👇 Make sure the chromium bin is traced for the routes that use it
  // Try the simple "all API" glob first:
  outputFileTracingIncludes: {
    '/api/**': ['node_modules/@sparticuz/chromium/bin/**'],
  },
  output: "standalone"
  // (optional) if you're in a monorepo:
  // outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default withNextIntl(nextConfig);
