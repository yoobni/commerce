/**
 * Admin review queries. Re-exports lib/api/reviews + UI labels/variants.
 */

import type { PaginatedResponse } from '@commerce/types';
import {
  adminListReviews as apiListReviews,
  adminGetReview as apiGetReview,
  type AdminReviewRow,
  type AdminReviewListParams,
} from '@/lib/api/reviews';

export type { AdminReviewRow, AdminReviewListParams };

// UI labels live in lib/admin-ui/reviews-labels.ts (safe for client imports).
export {
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_VARIANT,
  SIZE_FEEDBACK_LABEL,
} from '@/lib/admin-ui/reviews-labels';

// ─── Re-exported queries ────────────────────────────────────────────────────

export async function adminListReviews(
  params: AdminReviewListParams = {}
): Promise<PaginatedResponse<AdminReviewRow>> {
  return apiListReviews(params);
}

export async function adminGetReview(id: string): Promise<AdminReviewRow | null> {
  return apiGetReview(id);
}
