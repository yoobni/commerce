'use client';

// Client-side review helpers — mutations + load-more.

import type { PaginatedResponse } from '@commerce/types';
import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import { apiGetList, apiPost } from './client';
import type { ReviewWithUser } from './reviews';

async function browserToken(): Promise<string | undefined> {
  const supabase = createBrowserSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export interface ReviewFormData {
  productId: string;
  rating: number;
  content: string;
  purchasedSize: string;
  sizeFeedback: 'SMALL' | 'PERFECT' | 'LARGE';
  dogBreed?: string;
  dogWeightKg?: number;
}

export async function submitReview(form: ReviewFormData): Promise<{ id: string }> {
  return apiPost('/reviews', {
    accessToken: await browserToken(),
    body: {
      product_id: form.productId,
      rating: form.rating,
      content: form.content,
      purchased_size: form.purchasedSize,
      size_feedback: form.sizeFeedback,
      dog_breed: form.dogBreed,
      dog_weight_kg: form.dogWeightKg,
    },
  });
}

export async function loadMoreReviews(
  productId: string,
  page: number,
  photoOnly: boolean
): Promise<PaginatedResponse<ReviewWithUser>> {
  const sp = new URLSearchParams();
  sp.set('product_id', productId);
  sp.set('page', String(page));
  sp.set('per_page', '10');
  if (photoOnly) sp.set('photo_only', 'true');
  const { data, meta } = await apiGetList<ReviewWithUser>(`/reviews?${sp.toString()}`, {
    noStore: true,
  });
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}
