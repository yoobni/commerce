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

// ─── Submit a new review ──────────────────────────────────────────────────────

export interface ReviewFormData {
  productId: string;
  rating: number;
  content: string;
  purchasedSize: string;
  sizeFeedback: 'SMALL' | 'PERFECT' | 'LARGE';
  dogBreed?: string;
  dogWeightKg?: number;
}

export async function submitReviewAction(formData: ReviewFormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

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
    is_photo_review: false,
    is_best: false,
    status: 'ACTIVE',
    point_rewarded: false,
    images: [],
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;

  revalidatePath(`/products`);
}
