import type { Review, PaginatedResponse } from '@commerce/types';
import { createClient } from '../supabase/server';

export interface ReviewWithProduct extends Review {
  product: {
    id: string;
    name_ko: string;
    name_en: string;
    name_ja: string;
    name_de: string;
    slug: string;
    thumbnail_url: string;
  };
}

export interface ReviewWithUser extends Review {
  user: { id: string; name: string; profile_image_url: string | null };
}

export interface ReviewStats {
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    total: number;
  };
  sizeFeedback: {
    SMALL: number;
    PERFECT: number;
    LARGE: number;
  };
}

export async function listProductReviews(
  productId: string,
  {
    page = 1,
    per_page = 10,
    photoOnly = false,
  }: { page?: number; per_page?: number; photoOnly?: boolean } = {}
): Promise<PaginatedResponse<ReviewWithUser>> {
  const supabase = await createClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('reviews') as any)
    .select(`*, user:users(id, name, profile_image_url)`, { count: 'exact' })
    .eq('product_id', productId)
    .eq('status', 'ACTIVE');

  if (photoOnly) query = query.eq('is_photo_review', true);

  query = query.order('created_at', { ascending: false }).range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
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

export async function listUserReviews(
  userId: string,
  { page = 1, per_page = 10 }: { page?: number; per_page?: number } = {}
): Promise<PaginatedResponse<ReviewWithProduct>> {
  const supabase = await createClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (supabase.from('reviews') as any)
    .select(
      `*, product:products(id, name_ko, name_en, name_ja, name_de, slug, thumbnail_url)`,
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .neq('status', 'DELETED')
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as ReviewWithProduct[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('reviews') as any)
    .select('rating, size_feedback')
    .eq('product_id', productId)
    .eq('status', 'ACTIVE');

  if (error) throw error;

  const rows = (data ?? []) as Array<{ rating: number; size_feedback: string | null }>;
  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 };
  const sizeFeedback = { SMALL: 0, PERFECT: 0, LARGE: 0 };

  for (const r of rows) {
    const star = r.rating as 1 | 2 | 3 | 4 | 5;
    if (star >= 1 && star <= 5) {
      ratingBreakdown[star]++;
      ratingBreakdown.total++;
    }
    if (
      r.size_feedback === 'SMALL' ||
      r.size_feedback === 'PERFECT' ||
      r.size_feedback === 'LARGE'
    ) {
      sizeFeedback[r.size_feedback]++;
    }
  }

  return { ratingBreakdown, sizeFeedback };
}
