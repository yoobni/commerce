import { apiGetOne, apiPost } from '../client';
import { getAccessToken } from '../auth';

export interface ToggleLikeResult {
  liked: boolean;
  like_count: number;
}

export async function togglePostLike(postId: string): Promise<ToggleLikeResult> {
  const accessToken = (await getAccessToken()) ?? undefined;
  return apiPost(`/community/posts/${postId}/likes`, { accessToken });
}

export async function toggleCommentLike(commentId: string): Promise<ToggleLikeResult> {
  const accessToken = (await getAccessToken()) ?? undefined;
  return apiPost(`/community/comments/${commentId}/likes`, { accessToken });
}

/** Whether the current viewer has liked this post. Returns false if unauthenticated. */
export async function hasLikedPost(postId: string): Promise<boolean> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) return false;
  const result = await apiGetOne<{ liked: boolean }>(
    `/community/posts/${postId}/likes/me`,
    { accessToken, noStore: true }
  );
  return result.liked;
}

/** Comment ids under this post that the viewer has liked. [] if unauthenticated. */
export async function likedCommentIdsForPost(postId: string): Promise<string[]> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) return [];
  const result = await apiGetOne<{ comment_ids: string[] }>(
    `/community/posts/${postId}/comments/likes/me`,
    { accessToken, noStore: true }
  );
  return result.comment_ids;
}
