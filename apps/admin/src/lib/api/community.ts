// Admin community API client. Server-side only.

import type {
  BoardType,
  Comment,
  PaginatedResponse,
  Post,
  PostStatus,
  User,
} from '@commerce/types';
import { apiGetList, apiGetOne, apiPatch } from './client';
import { getAdminToken } from './auth';

export interface AdminPostRow extends Post {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
}

export interface AdminCommentRow extends Comment {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
}

export interface AdminPostDetail extends Post {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
  comments: AdminCommentRow[];
}

export interface AdminPostListParams {
  status?: PostStatus | 'ALL';
  boardType?: BoardType | 'ALL';
  isPinned?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

function buildQuery(params: AdminPostListParams): string {
  const sp = new URLSearchParams();
  if (params.status && params.status !== 'ALL') sp.set('status', params.status);
  if (params.boardType && params.boardType !== 'ALL') sp.set('board_type', params.boardType);
  if (params.isPinned !== undefined) sp.set('is_pinned', String(params.isPinned));
  if (params.search) sp.set('search', params.search);
  if (params.page) sp.set('page', String(params.page));
  if (params.per_page) sp.set('per_page', String(params.per_page));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

async function authed() {
  const accessToken = await getAdminToken();
  return { accessToken, noStore: true } as const;
}

export async function adminListPosts(
  params: AdminPostListParams = {}
): Promise<PaginatedResponse<AdminPostRow>> {
  const { data, meta } = await apiGetList<AdminPostRow>(
    `/admin/community/posts${buildQuery(params)}`,
    await authed()
  );
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function adminGetPost(id: string): Promise<AdminPostDetail | null> {
  try {
    return await apiGetOne<AdminPostDetail>(`/admin/community/posts/${id}`, await authed());
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function adminSetPostStatus(id: string, status: PostStatus): Promise<void> {
  await apiPatch(`/admin/community/posts/${id}/status`, {
    ...(await authed()),
    body: { status },
  });
}

export async function adminSetPostPinned(id: string, isPinned: boolean): Promise<void> {
  await apiPatch(`/admin/community/posts/${id}/pin`, {
    ...(await authed()),
    body: { is_pinned: isPinned },
  });
}

export async function adminSetCommentStatus(
  commentId: string,
  status: PostStatus
): Promise<void> {
  await apiPatch(`/admin/community/comments/${commentId}/status`, {
    ...(await authed()),
    body: { status },
  });
}
