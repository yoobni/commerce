import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const STATIC_IMMUTABLE = 'public, max-age=31536000, immutable';
const NO_STORE = 'no-store, must-revalidate';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'placedog.net',
      },
    ],
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
    ];
  },
  experimental: {
    ppr: false,
  },
};

export default withNextIntl(nextConfig);
