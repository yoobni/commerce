import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { defaultLocale } from '@/i18n/routing';

const NAVER_TOKEN_URL = 'https://nid.naver.com/oauth2.0/token';
const NAVER_PROFILE_URL = 'https://openapi.naver.com/v1/nid/me';

interface NaverTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface NaverProfileResponse {
  resultcode: string;
  message: string;
  response?: {
    id: string;
    email?: string;
    name?: string;
    profile_image?: string;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieState = request.cookies.get('naver_oauth_state')?.value;
  const next = request.cookies.get('naver_oauth_next')?.value ?? `/${defaultLocale}`;

  const errorRedirect = (msg: string) => {
    const res = NextResponse.redirect(
      `${origin}/${defaultLocale}/auth/login?error=${msg}`
    );
    res.cookies.delete('naver_oauth_state');
    res.cookies.delete('naver_oauth_next');
    return res;
  };

  // Validate state to prevent CSRF
  if (!code || !state || !cookieState || state !== cookieState) {
    return errorRedirect('naver_state_mismatch');
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return errorRedirect('naver_not_configured');
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch(NAVER_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        state,
      }),
    });
    const tokenData = (await tokenRes.json()) as NaverTokenResponse;
    if (!tokenData.access_token) {
      return errorRedirect('naver_token_failed');
    }

    // 2. Fetch Naver user profile
    const profileRes = await fetch(NAVER_PROFILE_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = (await profileRes.json()) as NaverProfileResponse;
    if (profileData.resultcode !== '00' || !profileData.response?.email) {
      return errorRedirect('naver_profile_failed');
    }

    const { email, name, profile_image } = profileData.response;

    // 3. Find or create Supabase user via admin API
    const admin = createAdminClient();

    // Look up existing user by email via the public users table (service role bypasses RLS)
    const { data: existingRow } = await admin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingRow?.id) {
      // Update provider metadata on the existing auth user
      await admin.auth.admin.updateUserById(existingRow.id as string, {
        user_metadata: { provider: 'naver', name, profile_image },
      });
    } else {
      const { error: createError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name: name ?? email.split('@')[0], profile_image, provider: 'naver' },
      });
      if (createError) return errorRedirect('naver_create_failed');
    }

    // 4. Generate a magic link to establish a Supabase session
    //    redirectTo points to our existing callback so exchangeCodeForSession runs
    const callbackUrl = `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: callbackUrl },
    });
    if (linkError || !linkData?.properties?.action_link) {
      return errorRedirect('naver_session_failed');
    }

    // Clear temporary cookies and redirect user through the magic link
    const response = NextResponse.redirect(linkData.properties.action_link);
    response.cookies.delete('naver_oauth_state');
    response.cookies.delete('naver_oauth_next');
    return response;
  } catch {
    return errorRedirect('naver_unknown_error');
  }
}
