import { apiGetOne } from './client';
import { getAccessToken } from './auth';

export interface PointBalance {
  balance: number;
  pending: number;
}

/** Server-side: viewer's point balance, or zero balance if anonymous. */
export async function getUserPointBalance(): Promise<PointBalance | null> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) return null;
  return apiGetOne<PointBalance>('/points/me/balance', { accessToken, noStore: true });
}
