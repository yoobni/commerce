import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale } from '@/i18n/routing';

const NAVER_AUTH_URL = 'https://nid.naver.com/oauth2.0/authorize';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get('next') ?? `/${defaultLocale}`;

  const clientId = process.env.NAVER_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      `${origin}/${defaultLocale}/auth/login?error=naver_not_configured`
    );
  }

  const state = crypto.randomUUID();
  const callbackUrl = `${origin}/api/auth/naver/callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: callbackUrl,
    state,
  });

  const response = NextResponse.redirect(`${NAVER_AUTH_URL}?${params.toString()}`);

  // Store state + next destination for verification in callback
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 300, // 5 minutes
    path: '/',
  };
  response.cookies.set('naver_oauth_state', state, cookieOpts);
  response.cookies.set('naver_oauth_next', next, cookieOpts);

  return response;
}
