/**
 * Admin product queries — uses service-role client (bypasses RLS).
 */

import type {
  Product,
  ProductWithDetails,
  ProductOption,
  Category,
  Size,
  PaginatedResponse,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

export interface AdminProductListParams {
  status?: Product['status'] | 'ALL';
  category_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export type AdminProductRow = Product & {
  category: Pick<Category, 'id' | 'name_ko' | 'name_en'> | null;
};

export async function adminListProducts(
  params: AdminProductListParams = {}
): Promise<PaginatedResponse<AdminProductRow>> {
  const { status = 'ALL', category_id, search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('products') as any).select(
    'id, category_id, slug, name_ko, name_en, name_ja, name_de, base_price_krw, status, is_featured, thumbnail_url, created_at, updated_at, category:categories(id, name_ko, name_en)',
    { count: 'exact' }
  );

  if (status !== 'ALL') query = query.eq('status', status);
  if (category_id) query = query.eq('category_id', category_id);
  if (search) {
    query = query.or(
      `name_ko.ilike.%${search}%,name_en.ilike.%${search}%,slug.ilike.%${search}%`
    );
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as AdminProductRow[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

export type AdminProductDetail = Product & {
  category: Category;
  options: (ProductOption & { size: Size })[];
};

export async function adminGetProductDetail(id: string): Promise<AdminProductDetail | null> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('products') as any)
    .select(
      `*,
       category:categories(*),
       options:product_options(*, size:sizes(*))`
    )
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as AdminProductDetail;
}
