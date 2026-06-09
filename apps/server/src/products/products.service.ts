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
}

export interface ColorOption {
  name: string;
  hex: string;
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
    } = params;

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

    const total = count ?? 0;
    return {
      data: ((data ?? []) as Product[]).map(sanitizeProductImages),
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

  async getFeatured(limit = 8): Promise<Product[]> {
    const result = await this.list({ featured: true, per_page: limit });
    return result.data;
  }

  async searchForPost(query: string, excludeIds: string[] = []): Promise<Product[]> {
    const trimmed = query.trim().slice(0, 100);
    if (trimmed.length < 1) return [];
    const result = await this.list({ q: trimmed, per_page: 8 });
    if (excludeIds.length === 0) return result.data;
    const exclude = new Set(excludeIds);
    return result.data.filter((p) => !exclude.has(p.id));
  }

  async getByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];
    const unique = Array.from(new Set(ids)).slice(0, 50);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('products') as any)
      .select('*')
      .in('id', unique)
      .eq('status', 'ACTIVE');

    if (error || !data) return [];

    const rows = (data as Product[]).map((p) => sanitizeProductImages(p) as Product);
    // Preserve caller order so the post author's curation stays intact.
    const byId = new Map(rows.map((p) => [p.id, p]));
    return unique.map((id) => byId.get(id)).filter((p): p is Product => !!p);
  }

  async listAvailableColors(): Promise<ColorOption[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('product_options') as any)
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
}
