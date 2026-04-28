'use server';

import type { PaginatedResponse } from '@commerce/types';
import type { ReviewWithUser } from '../queries/reviews';
import { listProductReviews } from '../queries/reviews';
import { createClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';

// ─── Load more reviews (paginated, with optional photo filter) ────────────────

export async function loadMoreReviewsAction(
  productId: string,
  page: number,
  photoOnly: boolean
): Promise<PaginatedResponse<ReviewWithUser>> {
  return listProductReviews(productId, { page, per_page: 10, photoOnly });
}

// ─── Review form data ─────────────────────────────────────────────────────────

export interface ReviewFormData {
  productId: string;
  productSlug: string;
  rating: number;
  content: string;
  purchasedSize: string;
  sizeFeedback: 'SMALL' | 'PERFECT' | 'LARGE';
  dogBreed?: string;
  dogWeightKg?: number;
  images?: string[];
}

export interface ReviewUpdateData {
  productSlug: string;
  rating: number;
  content: string;
  purchasedSize: string;
  sizeFeedback: 'SMALL' | 'PERFECT' | 'LARGE';
  dogBreed?: string;
  dogWeightKg?: number;
  images?: string[];
}

// ─── Submit a new review ──────────────────────────────────────────────────────

export async function submitReviewAction(formData: ReviewFormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const images = formData.images ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reviews') as any).insert({
    user_id: user.id,
    product_id: formData.productId,
    rating: formData.rating,
    content: formData.content,
    purchased_size: formData.purchasedSize,
    size_feedback: formData.sizeFeedback,
    dog_breed: formData.dogBreed ?? null,
    dog_weight_kg: formData.dogWeightKg ?? null,
    is_photo_review: images.length > 0,
    is_best: false,
    status: 'ACTIVE',
    point_rewarded: false,
    images,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;

  revalidatePath(`/products/${formData.productSlug}`);
  revalidatePath('/products');
}

// ─── Update an existing review ────────────────────────────────────────────────

export async function updateReviewAction(
  reviewId: string,
  data: ReviewUpdateData
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const images = data.images ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reviews') as any)
    .update({
      rating: data.rating,
      content: data.content,
      purchased_size: data.purchasedSize,
      size_feedback: data.sizeFeedback,
      dog_breed: data.dogBreed ?? null,
      dog_weight_kg: data.dogWeightKg ?? null,
      is_photo_review: images.length > 0,
      images,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE');
  if (error) throw error;

  revalidatePath(`/products/${data.productSlug}`);
}

// ─── Soft-delete a review ─────────────────────────────────────────────────────

export async function deleteReviewAction(
  reviewId: string,
  productSlug: string
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reviews') as any)
    .update({ status: 'DELETED', updated_at: new Date().toISOString() })
    .eq('id', reviewId)
    .eq('user_id', user.id);
  if (error) throw error;

  revalidatePath(`/products/${productSlug}`);
  revalidatePath('/products');
}
