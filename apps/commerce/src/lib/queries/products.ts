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
  size_labels?: string[];
  colors?: string[];
  min_price_krw?: number;
  max_price_krw?: number;
  /** Free-text search across all name_* fields (case-insensitive ilike) */
  search?: string;
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
    size_labels,
    colors,
    min_price_krw,
    max_price_krw,
    search,
  } = params;

  const supabase = await createClient();
  const offset = (page - 1) * per_page;

  // Resolve category_id from slug upfront to avoid subquery complexity
  let categoryId: string | undefined;
  if (category_slug) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: cat } = await (supabase.from('categories') as any)
      .select('id')
      .eq('slug', category_slug)
      .single();
    if (!cat) return { data: [], total: 0, page, per_page, has_next: false };
    categoryId = (cat as { id: string }).id;
  }

  // Resolve product_ids that match size filter
  let sizeFilteredIds: string[] | undefined;
  if (size_labels && size_labels.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sizeRows } = await (supabase.from('sizes') as any)
      .select('id')
      .in('label', size_labels);
    const sizeIds = ((sizeRows ?? []) as { id: string }[]).map((r) => r.id);
    if (sizeIds.length === 0) return { data: [], total: 0, page, per_page, has_next: false };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: optRows } = await (supabase.from('product_options') as any)
      .select('product_id')
      .in('size_id', sizeIds)
      .eq('is_active', true);
    const ids = [...new Set(((optRows ?? []) as { product_id: string }[]).map((r) => r.product_id))];
    if (ids.length === 0) return { data: [], total: 0, page, per_page, has_next: false };
    sizeFilteredIds = ids;
  }

  // Resolve product_ids that match color filter
  let colorFilteredIds: string[] | undefined;
  if (colors && colors.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: optRows } = await (supabase.from('product_options') as any)
      .select('product_id')
      .in('color', colors)
      .eq('is_active', true);
    const ids = [...new Set(((optRows ?? []) as { product_id: string }[]).map((r) => r.product_id))];
    if (ids.length === 0) return { data: [], total: 0, page, per_page, has_next: false };
    colorFilteredIds = ids;
  }

  // Intersect size + color filtered IDs if both applied
  let combinedIds: string[] | undefined;
  if (sizeFilteredIds && colorFilteredIds) {
    const set = new Set(colorFilteredIds);
    combinedIds = sizeFilteredIds.filter((id) => set.has(id));
    if (combinedIds.length === 0) return { data: [], total: 0, page, per_page, has_next: false };
  } else {
    combinedIds = sizeFilteredIds ?? colorFilteredIds;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('products') as any)
    .select('*', { count: 'exact' })
    .eq('status', status);

  if (categoryId) query = query.eq('category_id', categoryId);
  if (featured !== undefined) query = query.eq('is_featured', featured);
  if (combinedIds) query = query.in('id', combinedIds);
  if (min_price_krw !== undefined) query = query.gte('base_price_krw', min_price_krw);
  if (max_price_krw !== undefined) query = query.lte('base_price_krw', max_price_krw);
  if (search) {
    // Escape ilike special characters to prevent injection
    const s = search.replace(/[%_\\]/g, '\\$&');
    query = query.or(
      `name_ko.ilike.%${s}%,name_en.ilike.%${s}%,name_ja.ilike.%${s}%,name_de.ilike.%${s}%`
    );
  }

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

export interface ColorOption {
  name: string;
  hex: string;
}

/** Returns unique colors available across active product options. */
export async function listAvailableColors(): Promise<ColorOption[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('product_options') as any)
    .select('color, color_hex')
    .eq('is_active', true);

  if (error || !data) return [];

  const seen = new Set<string>();
  const colors: ColorOption[] = [];
  for (const row of data as { color: string; color_hex: string | null }[]) {
    if (!seen.has(row.color)) {
      seen.add(row.color);
      colors.push({ name: row.color, hex: row.color_hex ?? '#cccccc' });
    }
  }
  return colors;
}
