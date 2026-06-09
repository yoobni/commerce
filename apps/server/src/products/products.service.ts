import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product, ProductWithDetails, PaginatedResponse } from '@commerce/types';
import { SUPABASE_ANON } from '../supabase/supabase.module';
import { safeImageSrc } from '../common/safe-image-src';

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
  q?: string;
  /** Restrict result set to these ids (preserves caller order). */
  ids?: string[];
  /** Exclude these ids from result. */
  exclude?: string[];
}

const SORT_MAP: Record<
  NonNullable<ProductListParams['sort']>,
  { column: string; ascending: boolean }
> = {
  newest: { column: 'created_at', ascending: false },
  price_asc: { column: 'base_price_krw', ascending: true },
  price_desc: { column: 'base_price_krw', ascending: false },
  popular: { column: 'view_count', ascending: false },
};

function sanitizeProductImages<T extends Partial<Product>>(p: T): T {
  if (!p) return p;
  const thumb = safeImageSrc(p.thumbnail_url ?? null);
  const seen = new Set<string>();
  const images = Array.isArray(p.images)
    ? p.images
        .map((s) => safeImageSrc(s))
        .filter((s) => {
          if (seen.has(s)) return false;
          seen.add(s);
          return true;
        })
    : p.images;
  return { ...p, thumbnail_url: thumb, images } as T;
}

@Injectable()
export class ProductsService {
  constructor(@Inject(SUPABASE_ANON) private readonly supabase: SupabaseClient) {}

  async list(params: ProductListParams = {}): Promise<PaginatedResponse<Product>> {
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
      q,
      ids,
      exclude,
    } = params;

    // `ids` filter takes precedence (it's an explicit set). Empty ids short-
    // circuits with empty page — saves a Supabase call.
    if (ids && ids.length === 0) {
      return { data: [], total: 0, page, per_page, has_next: false };
    }

    const offset = (page - 1) * per_page;

    // Resolve category_id from slug upfront to avoid subquery complexity.
    let categoryId: string | undefined;
    if (category_slug) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: cat } = await (this.supabase.from('categories') as any)
        .select('id')
        .eq('slug', category_slug)
        .single();
      if (!cat) return { data: [], total: 0, page, per_page, has_next: false };
      categoryId = (cat as { id: string }).id;
    }

    // Resolve product_ids that match size filter.
    let sizeFilteredIds: string[] | undefined;
    if (size_labels && size_labels.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: sizeRows } = await (this.supabase.from('sizes') as any)
        .select('id')
        .in('label', size_labels);
      const sizeIds = ((sizeRows ?? []) as { id: string }[]).map((r) => r.id);
      if (sizeIds.length === 0) return { data: [], total: 0, page, per_page, has_next: false };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: optRows } = await (this.supabase.from('product_options') as any)
        .select('product_id')
        .in('size_id', sizeIds)
        .eq('is_active', true);
      const ids = [
        ...new Set(((optRows ?? []) as { product_id: string }[]).map((r) => r.product_id)),
      ];
      if (ids.length === 0) return { data: [], total: 0, page, per_page, has_next: false };
      sizeFilteredIds = ids;
    }

    // Resolve product_ids that match color filter.
    let colorFilteredIds: string[] | undefined;
    if (colors && colors.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: optRows } = await (this.supabase.from('product_options') as any)
        .select('product_id')
        .in('color', colors)
        .eq('is_active', true);
      const ids = [
        ...new Set(((optRows ?? []) as { product_id: string }[]).map((r) => r.product_id)),
      ];
      if (ids.length === 0) return { data: [], total: 0, page, per_page, has_next: false };
      colorFilteredIds = ids;
    }

    let combinedIds: string[] | undefined;
    if (sizeFilteredIds && colorFilteredIds) {
      const set = new Set(colorFilteredIds);
      combinedIds = sizeFilteredIds.filter((id) => set.has(id));
      if (combinedIds.length === 0)
        return { data: [], total: 0, page, per_page, has_next: false };
    } else {
      combinedIds = sizeFilteredIds ?? colorFilteredIds;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.supabase.from('products') as any)
      .select('*', { count: 'exact' })
      .eq('status', status);

    if (categoryId) query = query.eq('category_id', categoryId);
    if (featured !== undefined) query = query.eq('is_featured', featured);
    if (combinedIds) query = query.in('id', combinedIds);
    if (ids && ids.length > 0) {
      // Cap at 100 so a runaway query string can't force a 5000-id IN clause.
      query = query.in('id', ids.slice(0, 100));
    }
    if (exclude && exclude.length > 0) {
      // PostgREST not.in.(...) — exclude these ids.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).not('id', 'in', `(${exclude.slice(0, 100).join(',')})`);
    }
    if (min_price_krw !== undefined) query = query.gte('base_price_krw', min_price_krw);
    if (max_price_krw !== undefined) query = query.lte('base_price_krw', max_price_krw);
    if (q && q.trim()) {
      const safe = q
        .trim()
        .replace(/[,()\\:*"']/g, ' ')
        .replace(/[%_]/g, (m) => `\\${m}`)
        .slice(0, 100);
      if (safe.trim()) {
        const term = `%${safe}%`;
        query = query.or(`name_ko.ilike.${term},name_en.ilike.${term}`);
      }
    }

    const { column, ascending } = SORT_MAP[sort];
    query = query.order(column, { ascending }).range(offset, offset + per_page - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    let rows = ((data ?? []) as Product[]).map(sanitizeProductImages);
    // If caller passed `ids`, preserve their order — the same contract as the
    // old getByIds endpoint so community "mentioned products" still renders in
    // the author's chosen order.
    if (ids && ids.length > 0) {
      const byId = new Map(rows.map((p) => [p.id, p] as const));
      rows = ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
    }

    const total = count ?? 0;
    return {
      data: rows,
      total,
      page,
      per_page,
      has_next: offset + per_page < total,
    };
  }

  async getBySlug(slug: string): Promise<ProductWithDetails | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('products') as any)
      .select(
        `
        *,
        category:categories(*),
        options:product_options(
          *,
          size:sizes(*)
        )
      `
      )
      .eq('slug', slug)
      .eq('options.is_active', true)
      .single();

    if (error || !data) return null;
    return sanitizeProductImages(data as ProductWithDetails);
  }

  async getById(id: string): Promise<Product | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('products') as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return sanitizeProductImages(data as Product);
  }

}
