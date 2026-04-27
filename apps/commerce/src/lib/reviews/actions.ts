'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { SizeFeedback } from '@commerce/types';
import { listProductReviews, type ReviewWithUser } from '../queries/reviews';

interface ActionResult {
  success: boolean;
  error?: string;
}

export interface CreateReviewInput {
  product_id: string;
  rating: number;
  content: string;
  /** Image URLs — populated after file upload to Supabase Storage.
   * Bucket: 'review-images', path: `${userId}/${productId}/${filename}`
   * Use createBrowserClient + supabase.storage.from('review-images').upload()
   * before calling this action. Currently defaults to empty array.
   */
  images: string[];
  dog_weight_kg: number | null;
  dog_breed: string | null;
  size_feedback: SizeFeedback;
}

export async function createReviewAction(input: CreateReviewInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // Step 1: Find user's paid/delivered orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase.from('orders') as any)
    .select('id')
    .eq('user_id', user.id)
    .in('status', ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CONFIRMED']);

  const orderIds: string[] = ((orders ?? []) as Array<{ id: string }>).map((o) => o.id);
  if (orderIds.length === 0) return { success: false, error: 'not_purchased' };

  // Step 2: Find an order_item for this product (product_snapshot JSONB)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orderItems } = await (supabase.from('order_items') as any)
    .select('id, product_snapshot')
    .in('order_id', orderIds)
    .filter('product_snapshot->>product_id', 'eq', input.product_id)
    .limit(1);

  if (!orderItems || orderItems.length === 0) {
    return { success: false, error: 'not_purchased' };
  }

  const orderItem = orderItems[0] as {
    id: string;
    product_snapshot: { size: string; product_id: string };
  };

  // Step 3: Prevent duplicate reviews
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('reviews') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', input.product_id)
    .not('status', 'eq', 'DELETED')
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: 'already_reviewed' };
  }

  const purchasedSize = orderItem.product_snapshot?.size ?? '';

  // Step 4: Insert review
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reviews') as any).insert({
    user_id: user.id,
    product_id: input.product_id,
    order_item_id: orderItem.id,
    rating: input.rating,
    content: input.content.trim(),
    images: input.images,
    dog_weight_kg: input.dog_weight_kg,
    dog_breed: input.dog_breed || null,
    purchased_size: purchasedSize,
    size_feedback: input.size_feedback,
    is_photo_review: input.images.length > 0,
    is_best: false,
    status: 'ACTIVE',
    point_rewarded: false,
  });

  if (error) return { success: false, error: (error as { message: string }).message };

  revalidatePath('/[locale]/products/[slug]', 'page');
  return { success: true };
}

export async function loadMoreReviewsAction(
  productId: string,
  page: number,
  photoOnly: boolean
): Promise<{ data: ReviewWithUser[]; has_next: boolean; total: number }> {
  const result = await listProductReviews(productId, {
    page,
    per_page: 5,
    photo_only: photoOnly,
  });
  return { data: result.data, has_next: result.has_next, total: result.total };
}
