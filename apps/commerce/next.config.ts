import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const STATIC_IMMUTABLE = 'public, max-age=31536000, immutable';
const NO_STORE = 'no-store, must-revalidate';
const isProd = process.env.NODE_ENV === 'production';

const CSP = [
  "default-src 'self'",
  "img-src 'self' https: data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: CSP },
  ...(isProd
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: STATIC_IMMUTABLE }],
      },
      {
        source: '/favicon.ico',
        headers: [{ key: 'Cache-Control', value: STATIC_IMMUTABLE }],
      },
      {
        source: '/api/(.*)',
        headers: [{ key: 'Cache-Control', value: NO_STORE }],
      },
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },
  experimental: {
    ppr: false,
  },
};

export default withNextIntl(nextConfig);
