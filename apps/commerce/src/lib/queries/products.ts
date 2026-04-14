/**
 * Product queries — Supabase Server Component direct queries.
 * Signatures are identical to lib/api/products.ts for zero-churn migration.
 */

import type { Product, ProductWithDetails, PaginatedResponse } from '@commerce/types';
import { createClient } from '../supabase/server';

export interface ProductListParams {
  category_slug?: string;
  status?: Product['status'];
  featured?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  per_page?: number;
}

const SORT_MAP: Record<NonNullable<ProductListParams['sort']>, { column: string; ascending: boolean }> = {
  newest:     { column: 'created_at',    ascending: false },
  price_asc:  { column: 'base_price_krw', ascending: true  },
  price_desc: { column: 'base_price_krw', ascending: false },
  popular:    { column: 'view_count',    ascending: false },
};

export async function listProducts(
  params: ProductListParams = {}
): Promise<PaginatedResponse<Product>> {
  const {
    category_slug,
    status = 'ACTIVE',
    featured,
    sort = 'newest',
    page = 1,
    per_page = 20,
  } = params;

  const supabase = await createClient();
  const offset = (page - 1) * per_page;

  // Resolve category_id from slug upfront to avoid subquery complexity
  let categoryId: string | undefined;
  if (category_slug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category_slug)
      .single();
    if (!cat) return { data: [], total: 0, page, per_page, has_next: false };
    categoryId = (cat as { id: string }).id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('products') as any)
    .select('*', { count: 'exact' })
    .eq('status', status);

  if (categoryId) query = query.eq('category_id', categoryId);
  if (featured !== undefined) query = query.eq('is_featured', featured);

  const { column, ascending } = SORT_MAP[sort];
  query = query.order(column, { ascending }).range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as Product[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: product, error } = await (supabase.from('products') as any)
    .select(`
      *,
      category:categories(*),
      options:product_options(
        *,
        size:sizes(*)
      )
    `)
    .eq('slug', slug)
    .eq('options.is_active', true)
    .single();

  if (error || !product) return null;
  return product as ProductWithDetails;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('products') as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Product;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const result = await listProducts({ featured: true, per_page: limit });
  return result.data;
}
