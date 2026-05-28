/**
 * Admin review queries — uses service-role client (bypasses RLS).
 */

import type {
  Review,
  ReviewStatus,
  SizeFeedback,
  User,
  PaginatedResponse,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

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

// ─── Extended types ───────────────────────────────────────────────────────────

export interface AdminReviewRow extends Review {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
  product: { id: string; name_ko: string; thumbnail_url: string } | null;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export interface AdminReviewListParams {
  status?: ReviewStatus | 'ALL';
  isBest?: boolean;
  isPhoto?: boolean;
  minRating?: number;
  search?: string; // product name or user name
  page?: number;
  per_page?: number;
}

export async function adminListReviews(
  params: AdminReviewListParams = {}
): Promise<PaginatedResponse<AdminReviewRow>> {
  const { status = 'ALL', isBest, isPhoto, minRating, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('reviews') as any).select(
    '*, user:users!user_id(id, name, profile_image_url), product:products!product_id(id, name_ko, thumbnail_url)',
    { count: 'exact' }
  );

  if (status !== 'ALL') query = query.eq('status', status);
  if (isBest !== undefined) query = query.eq('is_best', isBest);
  if (isPhoto !== undefined) query = query.eq('is_photo_review', isPhoto);
  if (minRating !== undefined) query = query.gte('rating', minRating);

  query = query.order('created_at', { ascending: false }).range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as AdminReviewRow[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function adminGetReview(id: string): Promise<AdminReviewRow | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('reviews') as any)
    .select(
      '*, user:users!user_id(id, name, profile_image_url), product:products!product_id(id, name_ko, thumbnail_url)'
    )
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as AdminReviewRow;
}
