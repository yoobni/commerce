'use server';

import { createClient } from '@/lib/supabase/server';
import type { SizeFeedback } from './queries';

export interface CreateReviewInput {
  order_item_id: string;
  product_id: string;
  rating: number;
  content: string;
  size_feedback: SizeFeedback;
  purchased_size: string;
  dog_weight_kg: number | null;
  dog_breed: string | null;
  image_urls: string[];
}

export interface CreateReviewResult {
  success: boolean;
  review_id?: string;
  error?: string;
}

/**
 * Create a product review.
 * Validates: auth, order item ownership, eligible status, no duplicate review.
 */
export async function createReviewAction(
  input: CreateReviewInput
): Promise<CreateReviewResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'not_authenticated' };

  // Validate rating range
  if (input.rating < 1 || input.rating > 5) {
    return { success: false, error: 'invalid_rating' };
  }

  // Validate content length
  if (input.content.trim().length < 10) {
    return { success: false, error: 'content_too_short' };
  }

  // Verify order_item belongs to this user and is in eligible status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orderItem } = await (supabase as any)
    .from('order_items')
    .select(
      `id, status, product_snapshot,
       orders ( user_id )`
    )
    .eq('id', input.order_item_id)
    .in('status', ['DELIVERED', 'CONFIRMED'])
    .maybeSingle();

  if (!orderItem) return { success: false, error: 'not_eligible' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderUserId = (orderItem.orders as any)?.user_id as string | undefined;
  if (orderUserId !== user.id) return { success: false, error: 'not_eligible' };

  // Prevent duplicate review
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('reviews')
    .select('id')
    .eq('order_item_id', input.order_item_id)
    .maybeSingle();

  if (existing) return { success: false, error: 'already_reviewed' };

  // Insert review
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: review, error } = await (supabase as any)
    .from('reviews')
    .insert({
      user_id: user.id,
      product_id: input.product_id,
      order_item_id: input.order_item_id,
      rating: input.rating,
      content: input.content.trim(),
      size_feedback: input.size_feedback,
      purchased_size: input.purchased_size,
      dog_weight_kg: input.dog_weight_kg,
      dog_breed: input.dog_breed ? input.dog_breed.trim() : null,
      images: input.image_urls.length > 0 ? input.image_urls : null,
      is_photo_review: input.image_urls.length > 0,
      status: 'ACTIVE',
      is_best: false,
      point_rewarded: false,
    })
    .select('id')
    .single();

  if (error) {
    return {
      success: false,
      error: (error as { message?: string }).message ?? 'unknown_error',
    };
  }

  return { success: true, review_id: (review as { id: string }).id };
}
