import type { PaginatedResponse, Review } from '@commerce/types';
import { apiGetList, apiGetOne } from './client';

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

const REVALIDATE = 30;

export async function listProductReviews(
  productId: string,
  {
    page = 1,
    per_page = 10,
    photoOnly = false,
  }: { page?: number; per_page?: number; photoOnly?: boolean } = {}
): Promise<PaginatedResponse<ReviewWithUser>> {
  const sp = new URLSearchParams();
  sp.set('product_id', productId);
  sp.set('page', String(page));
  sp.set('per_page', String(per_page));
  if (photoOnly) sp.set('photo_only', 'true');
  const { data, meta } = await apiGetList<ReviewWithUser>(`/reviews?${sp.toString()}`, {
    revalidate: REVALIDATE,
  });
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const sp = new URLSearchParams();
  sp.set('product_id', productId);
  return apiGetOne<ReviewStats>(`/reviews/stats?${sp.toString()}`, { revalidate: REVALIDATE });
}
