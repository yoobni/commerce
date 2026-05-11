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
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET is not set');
  }
  return new TextEncoder().encode(secret);
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
