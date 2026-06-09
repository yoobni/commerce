import type { Comment, User } from '@commerce/types';
import { apiGetList, apiPost, apiPatch, apiDelete } from '../client';
import { getAccessToken } from '../auth';

export type CommentWithUser = Omit<Comment, 'user'> & {
  user: Pick<User, 'id' | 'name' | 'profile_image_url'> | null;
  replies?: CommentWithUser[];
};

export interface ListCommentsResult {
  data: CommentWithUser[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

const COMMENT_REVALIDATE = 15;

export async function listComments(
  postId: string,
  page = 1,
  perPage?: number
): Promise<ListCommentsResult> {
  const sp = new URLSearchParams();
  sp.set('page', String(page));
  if (perPage) sp.set('per_page', String(perPage));

  // Block filter is per-viewer — server resolves it from the token.
  const accessToken = (await getAccessToken()) ?? undefined;

  const { data, meta } = await apiGetList<CommentWithUser>(
    `/community/posts/${postId}/comments?${sp.toString()}`,
    { revalidate: COMMENT_REVALIDATE, accessToken }
  );
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function createComment(
  postId: string,
  content: string,
  parentId: string | null = null
): Promise<{ id: string }> {
  const accessToken = (await getAccessToken()) ?? undefined;
  return apiPost(`/community/posts/${postId}/comments`, {
    body: { content, parent_id: parentId },
    accessToken,
  });
}

export async function updateComment(commentId: string, content: string): Promise<void> {
  const accessToken = (await getAccessToken()) ?? undefined;
  await apiPatch<{ id: string }>(`/community/comments/${commentId}`, {
    body: { content },
    accessToken,
  });
}

export async function deleteComment(commentId: string): Promise<void> {
  const accessToken = (await getAccessToken()) ?? undefined;
  await apiDelete(`/community/comments/${commentId}`, { accessToken });
}
