import type { Address, User } from '@commerce/types';
import { apiGetOne, ApiCallError } from './client';
import { getAccessToken } from './auth';

/** Server-side: viewer's profile, or null if anonymous / not found. */
export async function getUserProfile(): Promise<User | null> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) return null;
  try {
    return await apiGetOne<User>('/account/me', { accessToken, noStore: true });
  } catch (e) {
    if (e instanceof ApiCallError && e.status === 404) return null;
    throw e;
  }
}

/** Server-side: viewer's saved addresses (default first), or [] if anonymous. */
export async function getAddresses(): Promise<Address[]> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) return [];
  return apiGetOne<Address[]>('/account/me/addresses', { accessToken, noStore: true });
}
