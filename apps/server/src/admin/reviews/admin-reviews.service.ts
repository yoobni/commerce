import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';
import type { PaginatedResponse, Review, ReviewStatus, User } from '@commerce/types';

export interface AdminReviewRow extends Review {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
  product: { id: string; name_ko: string; thumbnail_url: string } | null;
}

export interface ListParams {
  status?: ReviewStatus | 'ALL';
  is_best?: boolean;
  is_photo?: boolean;
  min_rating?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

@Injectable()
export class AdminReviewsService {
  private readonly logger = new Logger(AdminReviewsService.name);

  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async list(params: ListParams = {}): Promise<PaginatedResponse<AdminReviewRow>> {
    const { status = 'ALL', is_best, is_photo, min_rating, page = 1, per_page = 20 } = params;
    const offset = (page - 1) * per_page;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.supabase.from('reviews') as any).select(
      '*, user:users!user_id(id, name, profile_image_url), product:products!product_id(id, name_ko, thumbnail_url)',
      { count: 'exact' }
    );
    if (status !== 'ALL') query = query.eq('status', status);
    if (is_best !== undefined) query = query.eq('is_best', is_best);
    if (is_photo !== undefined) query = query.eq('is_photo_review', is_photo);
    if (min_rating !== undefined) query = query.gte('rating', min_rating);
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

  async getById(id: string): Promise<AdminReviewRow | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('reviews') as any)
      .select(
        '*, user:users!user_id(id, name, profile_image_url), product:products!product_id(id, name_ko, thumbnail_url)'
      )
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return data as AdminReviewRow;
  }

  async setStatus(id: string, status: ReviewStatus): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('reviews') as any)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      this.logger.error(`[setStatus] ${error.message}`);
      throw new BadRequestException('review_status_update_failed');
    }
  }

  async setBest(id: string, isBest: boolean): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('reviews') as any)
      .update({ is_best: isBest, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      this.logger.error(`[setBest] ${error.message}`);
      throw new BadRequestException('review_best_update_failed');
    }
  }

  async setPointRewarded(id: string, rewarded: boolean): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('reviews') as any)
      .update({ point_rewarded: rewarded, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      this.logger.error(`[setPointRewarded] ${error.message}`);
      throw new BadRequestException('review_point_update_failed');
    }
  }
}
