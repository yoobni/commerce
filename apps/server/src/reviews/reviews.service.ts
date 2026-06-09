import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PaginatedResponse, Review } from '@commerce/types';
import { SUPABASE_ADMIN } from '../supabase/supabase.module';
import { safeImageSrc } from '../common/safe-image-src';

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

export interface ListReviewsParams {
  productId: string;
  page?: number;
  perPage?: number;
  photoOnly?: boolean;
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  content: string;
  purchasedSize: string;
  sizeFeedback: 'SMALL' | 'PERFECT' | 'LARGE';
  dogBreed?: string | null;
  dogWeightKg?: number | null;
}

// users join requires service-role (own-row RLS); NestJS is the BFF, so we
// authorize at the controller (status='ACTIVE', auth guard on mutations).

@Injectable()
export class ReviewsService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async listForProduct(params: ListReviewsParams): Promise<PaginatedResponse<ReviewWithUser>> {
    const { productId, page = 1, perPage = 10, photoOnly = false } = params;
    const offset = (page - 1) * perPage;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.supabase.from('reviews') as any)
      .select('*, user:users(id, name, profile_image_url)', { count: 'exact' })
      .eq('product_id', productId)
      .eq('status', 'ACTIVE');
    if (photoOnly) query = query.eq('is_photo_review', true);
    query = query.order('created_at', { ascending: false }).range(offset, offset + perPage - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count ?? 0;
    return {
      data: ((data ?? []) as ReviewWithUser[]).map((r) => ({
        ...r,
        user: { ...r.user, profile_image_url: safeImageSrc(r.user?.profile_image_url) },
      })),
      total,
      page,
      per_page: perPage,
      has_next: offset + perPage < total,
    };
  }

  async stats(productId: string): Promise<ReviewStats> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('reviews') as any)
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

  async create(authorId: string, input: CreateReviewInput): Promise<{ id: string }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('reviews') as any)
      .insert({
        user_id: authorId,
        product_id: input.productId,
        rating: input.rating,
        content: input.content,
        purchased_size: input.purchasedSize,
        size_feedback: input.sizeFeedback,
        dog_breed: input.dogBreed ?? null,
        dog_weight_kg: input.dogWeightKg ?? null,
        is_photo_review: false,
        is_best: false,
        status: 'ACTIVE',
        point_rewarded: false,
        images: [],
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error || !data) throw error ?? new Error('community_db_error');
    return { id: (data as { id: string }).id };
  }
}
