import { apiGetOne, apiPost, apiDelete } from '../client';
import { getAccessToken } from '../auth';

/** Viewer's own block list. [] if unauthenticated. */
export async function listMyBlocks(): Promise<string[]> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) return [];
  const result = await apiGetOne<{ blocked_ids: string[] }>(
    '/community/user-blocks/me',
    { accessToken, noStore: true }
  );
  return result.blocked_ids;
}

/** Convenience alias used by the rest of the app (formerly getBlockedUserIds). */
export const getBlockedUserIds = (viewerId: string | null): Promise<string[]> => {
  if (!viewerId) return Promise.resolve([]);
  return listMyBlocks();
};

export async function blockUser(targetUserId: string): Promise<void> {
  const accessToken = (await getAccessToken()) ?? undefined;
  await apiPost<{ target_user_id: string }>('/community/user-blocks', {
    body: { target_user_id: targetUserId },
    accessToken,
  });
}

export async function unblockUser(targetUserId: string): Promise<void> {
  const accessToken = (await getAccessToken()) ?? undefined;
  await apiDelete(`/community/user-blocks/${targetUserId}`, { accessToken });
}
