/**
 * Admin community queries. Re-exports lib/api/community + UI labels/variants.
 */

import type { PaginatedResponse } from '@commerce/types';
import {
  adminListPosts as apiListPosts,
  adminGetPost as apiGetPost,
  type AdminPostRow,
  type AdminPostDetail,
  type AdminCommentRow,
  type AdminPostListParams,
} from '@/lib/api/community';

export type { AdminPostRow, AdminPostDetail, AdminCommentRow, AdminPostListParams };

// UI labels live in lib/admin-ui/community-labels.ts (safe for client imports).
export {
  POST_STATUS_LABEL,
  POST_STATUS_VARIANT,
  BOARD_TYPE_LABEL,
} from '@/lib/admin-ui/community-labels';

// ─── Re-exported queries ────────────────────────────────────────────────────

export async function adminListPosts(
  params: AdminPostListParams = {}
): Promise<PaginatedResponse<AdminPostRow>> {
  return apiListPosts(params);
}

export async function adminGetPost(id: string): Promise<AdminPostDetail | null> {
  return apiGetPost(id);
}
