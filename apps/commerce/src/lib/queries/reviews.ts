import type { Review, PaginatedResponse } from '@commerce/types';
import { createClient } from '../supabase/server';

export interface ReviewWithUser extends Review {
  user: { id: string; name: string; profile_image_url: string | null };
}

export async function listProductReviews(
  productId: string,
  { page = 1, per_page = 10 }: { page?: number; per_page?: number } = {}
): Promise<PaginatedResponse<ReviewWithUser>> {
  const supabase = await createClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (supabase.from('reviews') as any)
    .select(`
      *,
      user:users(id, name, profile_image_url)
    `, { count: 'exact' })
    .eq('product_id', productId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

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
