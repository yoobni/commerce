/**
 * Admin review queries. Re-exports lib/api/reviews + UI labels/variants.
 */

import type { PaginatedResponse, ReviewStatus, SizeFeedback } from '@commerce/types';
import {
  adminListReviews as apiListReviews,
  adminGetReview as apiGetReview,
  type AdminReviewRow,
  type AdminReviewListParams,
} from '@/lib/api/reviews';

export type { AdminReviewRow, AdminReviewListParams };

// ─── UI labels & Badge variants (어드민 페이지 공용) ────────────────────────

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  ACTIVE: '노출',
  HIDDEN: '숨김',
  DELETED: '삭제',
};

export const REVIEW_STATUS_VARIANT: Record<
  ReviewStatus,
  'success' | 'warning' | 'destructive'
> = {
  ACTIVE: 'success',
  HIDDEN: 'warning',
  DELETED: 'destructive',
};

export const SIZE_FEEDBACK_LABEL: Record<SizeFeedback, string> = {
  SMALL: '작음',
  PERFECT: '적합',
  LARGE: '큼',
};

// ─── Re-exported queries ────────────────────────────────────────────────────

export async function adminListReviews(
  params: AdminReviewListParams = {}
): Promise<PaginatedResponse<AdminReviewRow>> {
  return apiListReviews(params);
}

export async function adminGetReview(id: string): Promise<AdminReviewRow | null> {
  return apiGetReview(id);
}
