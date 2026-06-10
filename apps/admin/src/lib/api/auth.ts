// Auth wrappers. Server-side only — call from server actions or RSC.

import { cookies } from 'next/headers';
import { COOKIE_NAME, type AdminRole } from '../auth/session';
import { apiPost, ApiCallError } from './client';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface LoginResult {
  token: string;
  admin: AdminSession;
  expires_at: string;
}

/**
 * Forward credentials to @commerce/server. Throws ApiCallError on bad
 * credentials / inactive account so the caller can map to UI messages.
 */
export async function postLogin(email: string, password: string): Promise<LoginResult> {
  return apiPost<LoginResult>('/admin/auth/login', {
    body: { email, password },
  });
}

/** Revokes the server-side admin_sessions row. */
export async function postLogout(token: string): Promise<void> {
  try {
    await apiPost('/admin/auth/logout', { accessToken: token });
  } catch (e) {
    // Revocation is best-effort — the cookie clear below still logs the user
    // out of this browser even if the bookkeeping fails.
    if (!(e instanceof ApiCallError)) throw e;
  }
}

/** Read the admin cookie for forwarding to authenticated server endpoints. */
export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}
