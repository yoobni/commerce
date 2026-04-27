import type { Review, PaginatedResponse } from '@commerce/types';
import { createClient } from '../supabase/server';

export interface ReviewWithUser extends Review {
  user: { id: string; name: string; profile_image_url: string | null };
}

export interface RatingBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  total: number;
}

export interface SizeFeedbackBreakdown {
  SMALL: number;
  PERFECT: number;
  LARGE: number;
}

export interface ReviewStats {
  ratingBreakdown: RatingBreakdown;
  sizeFeedback: SizeFeedbackBreakdown;
}

/** Aggregate rating distribution + size feedback counts for a product */
export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('reviews') as any)
    .select('rating, size_feedback')
    .eq('product_id', productId)
    .eq('status', 'ACTIVE');

  const rows = (data ?? []) as Array<{ rating: number; size_feedback: string }>;

  const ratingBreakdown: RatingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: rows.length };
  const sizeFeedback: SizeFeedbackBreakdown = { SMALL: 0, PERFECT: 0, LARGE: 0 };

  for (const r of rows) {
    const star = r.rating as 1 | 2 | 3 | 4 | 5;
    if (star >= 1 && star <= 5) ratingBreakdown[star]++;
    if (r.size_feedback === 'SMALL') sizeFeedback.SMALL++;
    else if (r.size_feedback === 'PERFECT') sizeFeedback.PERFECT++;
    else if (r.size_feedback === 'LARGE') sizeFeedback.LARGE++;
  }

  return { ratingBreakdown, sizeFeedback };
}

export async function listProductReviews(
  productId: string,
  {
    page = 1,
    per_page = 5,
    photo_only = false,
  }: { page?: number; per_page?: number; photo_only?: boolean } = {}
): Promise<PaginatedResponse<ReviewWithUser>> {
  const supabase = await createClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('reviews') as any)
    .select(
      `
      *,
      user:users(id, name, profile_image_url)
    `,
      { count: 'exact' }
    )
    .eq('product_id', productId)
    .eq('status', 'ACTIVE');

  if (photo_only) {
    query = query.eq('is_photo_review', true);
  }

  const { data, count, error } = await query
    .order('is_best', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as ReviewWithUser[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}
