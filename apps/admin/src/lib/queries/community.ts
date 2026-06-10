/**
 * Admin community queries. Re-exports lib/api/community + UI labels/variants.
 */

import type {
  BoardType,
  PaginatedResponse,
  PostStatus,
} from '@commerce/types';
import {
  adminListPosts as apiListPosts,
  adminGetPost as apiGetPost,
  type AdminPostRow,
  type AdminPostDetail,
  type AdminCommentRow,
  type AdminPostListParams,
} from '@/lib/api/community';

export type { AdminPostRow, AdminPostDetail, AdminCommentRow, AdminPostListParams };

// ─── UI labels & Badge variants (어드민 페이지 공용) ────────────────────────

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  ACTIVE: '노출',
  HIDDEN: '숨김',
  DELETED: '삭제',
};

export const POST_STATUS_VARIANT: Record<
  PostStatus,
  'success' | 'warning' | 'destructive'
> = {
  ACTIVE: 'success',
  HIDDEN: 'warning',
  DELETED: 'destructive',
};

export const BOARD_TYPE_LABEL: Record<BoardType, string> = {
  DAILY: '일상',
  STYLE: '스타일',
  TIP: '팁',
  QUESTION: '질문',
};

// ─── Re-exported queries ────────────────────────────────────────────────────

export async function adminListPosts(
  params: AdminPostListParams = {}
): Promise<PaginatedResponse<AdminPostRow>> {
  return apiListPosts(params);
}

export async function adminGetPost(id: string): Promise<AdminPostDetail | null> {
  return apiGetPost(id);
}
