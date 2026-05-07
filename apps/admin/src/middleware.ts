import { type NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/login', '/unauthorized'];
const COOKIE_NAME = 'admin_session';

/** Routes that require SUPER_ADMIN role. */
const SUPER_ADMIN_PATHS = ['/settings'];

const ROLE_RANK: Record<string, number> = {
  OPERATOR: 1,
  SUPER_ADMIN: 2,
};

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET ?? '';
  return new TextEncoder().encode(secret);
}

async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function isSessionRevoked(tokenHash: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return false;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/admin_sessions?token_hash=eq.${tokenHash}&is_revoked=eq.true&select=id&limit=1`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    );
    if (!res.ok) return false;
    const rows = (await res.json()) as { id: string }[];
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload['role'] as string;

    const tHash = await hashToken(token);
    if (await isSessionRevoked(tHash)) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    if (SUPER_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
      if ((ROLE_RANK[role] ?? 0) < ROLE_RANK['SUPER_ADMIN']) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
