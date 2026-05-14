import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { type AdminRole, hasPermission } from './roles';

export type { AdminRole };
export { hasPermission };

export const COOKIE_NAME = 'admin_session';
const EXPIRY = '8h';

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error('ADMIN_JWT_SECRET is not set');
  if (secret.length < 32) {
    throw new Error('ADMIN_JWT_SECRET must be at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export async function signSession(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: payload['id'] as string,
      email: payload['email'] as string,
      name: payload['name'] as string,
      role: payload['role'] as AdminRole,
    };
  } catch {
    return null;
  }
}

/** Reads and verifies the session from the current request cookies. */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}
