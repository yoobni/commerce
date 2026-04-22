import { createClient } from '@/lib/supabase/server';

// ─── Display Types ─────────────────────────────────────────────────────────────

export type SizeFeedback = 'SMALL' | 'PERFECT' | 'LARGE';

export interface ReviewWithUser {
  id: string;
  user_id: string;
  product_id: string;
  order_item_id: string;
  rating: number;
  content: string;
  images: string[] | null;
  dog_weight_kg: number | null;
  dog_breed: string | null;
  purchased_size: string;
  size_feedback: SizeFeedback;
  is_photo_review: boolean;
  is_best: boolean;
  created_at: string;
  user: {
    id: string;
    name: string;
    profile_image_url: string | null;
  } | null;
}

export interface RatingStats {
  avg_rating: number;
  total: number;
  distribution: Record<number, number>;
}

export interface ReviewableOrderItem {
  order_item_id: string;
  order_number: string;
  product_id: string;
  product_name: string;
  product_thumbnail: string;
  purchased_size: string;
  ordered_at: string;
}

// ─── Queries ───────────────────────────────────────────────────────────────────

/** Fetch paginated reviews for a product (ACTIVE only, latest first). */
export async function getProductReviews(
  productId: string,
  page = 1,
  perPage = 10
): Promise<{ data: ReviewWithUser[]; total: number; has_next: boolean }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error, count } = await (supabase as any)
    .from('reviews')
    .select(
      `id, user_id, product_id, order_item_id, rating, content, images,
       dog_weight_kg, dog_breed, purchased_size, size_feedback,
       is_photo_review, is_best, created_at,
       users ( id, name, profile_image_url )`,
      { count: 'exact' }
    )
    .eq('product_id', productId)
    .eq('status', 'ACTIVE')
    .order('is_best', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !data) return { data: [], total: 0, has_next: false };

  const total = (count as number) ?? 0;
  const reviews: ReviewWithUser[] = (data as Record<string, unknown>[]).map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = row.users as any;
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      product_id: row.product_id as string,
      order_item_id: row.order_item_id as string,
      rating: row.rating as number,
      content: row.content as string,
      images: (row.images as string[] | null) ?? null,
      dog_weight_kg: (row.dog_weight_kg as number | null) ?? null,
      dog_breed: (row.dog_breed as string | null) ?? null,
      purchased_size: row.purchased_size as string,
      size_feedback: row.size_feedback as SizeFeedback,
      is_photo_review: row.is_photo_review as boolean,
      is_best: row.is_best as boolean,
      created_at: row.created_at as string,
      user: u
        ? {
            id: u.id as string,
            name: u.name as string,
            profile_image_url: (u.profile_image_url as string | null) ?? null,
          }
        : null,
    };
  });

  return { data: reviews, total, has_next: from + perPage < total };
}

/** Fetch rating distribution and average for a product. */
export async function getProductRatingStats(productId: string): Promise<RatingStats> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'ACTIVE');

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (!data || (data as { rating: number }[]).length === 0) {
    return { avg_rating: 0, total: 0, distribution };
  }

  let sum = 0;
  for (const row of data as { rating: number }[]) {
    distribution[row.rating] = (distribution[row.rating] ?? 0) + 1;
    sum += row.rating;
  }

  return {
    avg_rating: sum / (data as { rating: number }[]).length,
    total: (data as { rating: number }[]).length,
    distribution,
  };
}

/**
 * Fetch order items eligible for review by the authenticated user.
 * Eligible = DELIVERED or CONFIRMED status, no existing review.
 */
export async function getReviewableOrderItems(): Promise<ReviewableOrderItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch existing review order_item_ids for this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingReviews } = await (supabase as any)
    .from('reviews')
    .select('order_item_id')
    .eq('user_id', user.id);

  const reviewedIds = new Set<string>(
    ((existingReviews as { order_item_id: string }[]) ?? []).map((r) => r.order_item_id)
  );

  // Fetch delivered/confirmed order items for this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('order_items')
    .select(
      `id, product_snapshot, status,
       orders ( order_number, ordered_at, user_id )`
    )
    .in('status', ['DELIVERED', 'CONFIRMED']);

  if (!data) return [];

  const items: ReviewableOrderItem[] = [];
  for (const row of data as Record<string, unknown>[]) {
    if (reviewedIds.has(row.id as string)) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = row.orders as any;
    if (!order || (order.user_id as string) !== user.id) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snap = row.product_snapshot as any;
    items.push({
      order_item_id: row.id as string,
      order_number: (order.order_number as string) ?? '',
      product_id: (snap?.product_id as string) ?? '',
      product_name: (snap?.name as string) ?? '',
      product_thumbnail: (snap?.thumbnail_url as string) ?? '',
      purchased_size: (snap?.size as string) ?? '',
      ordered_at: (order.ordered_at as string) ?? '',
    });
  }
  return items;
}

/** Check if a review already exists for the given order item (current user). */
export async function getReviewByOrderItemId(
  orderItemId: string
): Promise<{ exists: boolean; review_id: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { exists: false, review_id: null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('reviews')
    .select('id')
    .eq('order_item_id', orderItemId)
    .eq('user_id', user.id)
    .maybeSingle();

  return { exists: !!data, review_id: data ? (data.id as string) : null };
}
