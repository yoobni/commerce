import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { rateLimit, getClientIp } from './lib/rate-limit';

const intlMiddleware = createIntlMiddleware(routing);

// Path segments (after the locale prefix) that require authentication
const PROTECTED_SEGMENTS = new Set(['account', 'checkout', 'orders', 'wishlist']);

// Auth-adjacent segments that need brute-force protection
const RATE_LIMITED_AUTH_SEGMENTS = new Set(['auth']);

function getSegmentAfterLocale(pathname: string): string {
  // pathname format: /[locale]/[segment]/...
  const parts = pathname.split('/').filter(Boolean);
  return parts[1] ?? '';
}

export async function middleware(request: NextRequest) {
  // 0. Rate-limit auth-adjacent POSTs (login, signup, password reset)
  const segment = getSegmentAfterLocale(request.nextUrl.pathname);
  if (
    request.method === 'POST' &&
    (RATE_LIMITED_AUTH_SEGMENTS.has(segment) ||
      request.nextUrl.pathname.startsWith('/api/auth/'))
  ) {
    const ip = getClientIp(request.headers);
    const key = `commerce:${ip}:${segment || 'api-auth'}`;
    const { ok, retryAfterSec } = rateLimit(key);
    if (!ok) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      });
    }
  }

  // 1. Run next-intl middleware for locale routing
  const intlResponse = intlMiddleware(request);

  // If next-intl issued a redirect (locale normalization), honour it immediately
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // 2. Attach Supabase session refresh on top of the intl response
  const response = intlResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );

  // Calling getUser() refreshes the session and writes updated cookies to response
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Guard protected routes
  if (PROTECTED_SEGMENTS.has(segment) && !user) {
    const locale = request.nextUrl.pathname.split('/').filter(Boolean)[0] ?? routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
