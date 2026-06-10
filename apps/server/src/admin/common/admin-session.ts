import { SignJWT, jwtVerify } from 'jose';
import type { AdminRole } from './admin-roles';

// Admin session token — jose-based JWT. Same secret/shape as apps/admin so
// tokens issued here can be verified by middleware on the admin frontend and
// vice versa (until the admin cookie path is fully proxied through here).

const EXPIRY = '8h';

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error('ADMIN_JWT_SECRET is not set');
  if (secret.length < 32) {
    throw new Error('ADMIN_JWT_SECRET must be at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export async function signSession(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<AdminSessionPayload | null> {
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
