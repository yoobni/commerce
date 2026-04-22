/**
 * Admin product & category queries — uses service-role client (bypasses RLS).
 */

import type {
  Product,
  ProductOption,
  Category,
  Size,
  PaginatedResponse,
  ProductStatus,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Extended types ───────────────────────────────────────────────────────────

export interface ProductRow {
  id: string;
  name_ko: string;
  name_en: string;
  slug: string;
  status: ProductStatus;
  base_price_krw: number;
  thumbnail_url: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category: { id: string; name_ko: string } | null;
}

export interface ProductOptionWithSize extends Omit<ProductOption, 'size'> {
  size: Size | null;
}

export interface ProductDetail extends Product {
  category: Category | null;
  options: ProductOptionWithSize[];
}

// ─── Params ───────────────────────────────────────────────────────────────────

export interface AdminProductListParams {
  status?: ProductStatus | 'ALL';
  category_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

// ─── Product list ─────────────────────────────────────────────────────────────

export async function adminListProducts(
  params: AdminProductListParams = {}
): Promise<PaginatedResponse<ProductRow>> {
  const { status = 'ALL', category_id, search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('products') as any).select(
    'id, name_ko, name_en, slug, status, base_price_krw, thumbnail_url, is_featured, created_at, updated_at, category:categories!category_id(id, name_ko)',
    { count: 'exact' }
  );

  if (status !== 'ALL') query = query.eq('status', status);
  if (category_id) query = query.eq('category_id', category_id);
  if (search)
    query = query.or(
      `name_ko.ilike.%${search}%,name_en.ilike.%${search}%,slug.ilike.%${search}%`
    );

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as ProductRow[],
    total: count ?? 0,
    page,
    per_page,
    has_next: offset + per_page < (count ?? 0),
  };
}

// ─── Product detail ───────────────────────────────────────────────────────────

export async function adminGetProduct(productId: string): Promise<ProductDetail | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('products') as any)
    .select(
      '*, category:categories!category_id(*), options:product_options(*, size:sizes(*))'
    )
    .eq('id', productId)
    .single();

  if (error || !data) return null;
  return data as ProductDetail;
}

// ─── Category list ────────────────────────────────────────────────────────────

export async function adminListCategories(): Promise<Category[]> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('categories') as any)
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Category[];
}

// ─── Sizes list ───────────────────────────────────────────────────────────────

export async function adminListSizes(): Promise<Size[]> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('sizes') as any)
    .select('id, label, sort_order')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Size[];
}
