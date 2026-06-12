import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const STATIC_IMMUTABLE = 'public, max-age=31536000, immutable';
const NO_STORE = 'no-store, must-revalidate';
const isProd = process.env.NODE_ENV === 'production';

// Backend API origin — must be whitelisted in CSP connect-src so the browser
// can fetch from @commerce/server. Read at build time from NEXT_PUBLIC_API_URL
// (falls back to the local dev port).
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4005';

const CSP = [
  "default-src 'self'",
  "img-src 'self' https: data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  `connect-src 'self' ${API_ORIGIN} https://*.supabase.co wss://*.supabase.co`,
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
  // Friendly aliases — 사용자가 흔히 입력하는 단축 경로를 실제 라우트
  // (/[locale]/auth/login, /auth/sign-up) 로 HTTP 307 redirect. localePrefix
  // 'always' 와 함께 동작하도록 모든 locale 변형 + locale 없는 root level
  // 둘 다 커버. 검색엔진은 noindex 시그널을 page 메타가 아닌 라우트
  // 단순 redirect 라 본 URL 만 인덱스.
  async redirects() {
    return [
      { source: '/login', destination: '/ko/auth/login', permanent: false },
      { source: '/signup', destination: '/ko/auth/sign-up', permanent: false },
      { source: '/sign-up', destination: '/ko/auth/sign-up', permanent: false },
      { source: '/:locale(en|ko|ja|de)/login', destination: '/:locale/auth/login', permanent: false },
      { source: '/:locale(en|ko|ja|de)/signup', destination: '/:locale/auth/sign-up', permanent: false },
      { source: '/:locale(en|ko|ja|de)/sign-up', destination: '/:locale/auth/sign-up', permanent: false },
    ];
  },
  experimental: {
    ppr: false,
  },
};

export default withNextIntl(nextConfig);
