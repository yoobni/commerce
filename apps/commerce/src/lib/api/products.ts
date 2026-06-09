/**
 * Products API client — calls @commerce/server (apps/server).
 * Signatures are kept close to the previous lib/queries/products.ts so caller
 * migration is mostly drop-in. Returns PaginatedResponse for list helpers.
 */

import type { Product, ProductWithDetails, PaginatedResponse } from '@commerce/types';
import { apiGetList, apiGetOne, ApiCallError } from './client';

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
  ids?: string[];
  exclude?: string[];
}

export interface ColorOption {
  name: string;
  hex: string;
}

const csv = (v: string[] | undefined): string | undefined =>
  v && v.length > 0 ? v.join(',') : undefined;

function buildQuery(params: ProductListParams): string {
  const sp = new URLSearchParams();
  if (params.category_slug) sp.set('category_slug', params.category_slug);
  if (params.status) sp.set('status', params.status);
  if (params.featured !== undefined) sp.set('featured', String(params.featured));
  if (params.sort) sp.set('sort', params.sort);
  if (params.page) sp.set('page', String(params.page));
  if (params.per_page) sp.set('per_page', String(params.per_page));
  const sizeLabels = csv(params.size_labels);
  if (sizeLabels) sp.set('size_labels', sizeLabels);
  const colors = csv(params.colors);
  if (colors) sp.set('colors', colors);
  if (params.min_price_krw !== undefined) sp.set('min_price_krw', String(params.min_price_krw));
  if (params.max_price_krw !== undefined) sp.set('max_price_krw', String(params.max_price_krw));
  if (params.q) sp.set('q', params.q);
  const ids = csv(params.ids);
  if (ids) sp.set('ids', ids);
  const exclude = csv(params.exclude);
  if (exclude) sp.set('exclude', exclude);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

/** Default ISR window for catalog reads in Server Components. */
const CATALOG_REVALIDATE = 60;

export async function listProducts(
  params: ProductListParams = {}
): Promise<PaginatedResponse<Product>> {
  const { data, meta } = await apiGetList<Product>(`/products${buildQuery(params)}`, {
    revalidate: CATALOG_REVALIDATE,
  });
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  try {
    return await apiGetOne<ProductWithDetails>(
      `/products/${encodeURIComponent(slug)}`,
      { revalidate: CATALOG_REVALIDATE }
    );
  } catch (e) {
    if (e instanceof ApiCallError && e.status === 404) return null;
    throw e;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await apiGetOne<Product>(`/products/by-id/${encodeURIComponent(id)}`, {
      revalidate: CATALOG_REVALIDATE,
    });
  } catch (e) {
    if (e instanceof ApiCallError && e.status === 404) return null;
    throw e;
  }
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const result = await listProducts({ featured: true, per_page: limit });
  return result.data;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) return [];
  // Server preserves caller order when `ids` is passed. We cap at 50 same as
  // the previous direct-Supabase implementation.
  const unique = Array.from(new Set(ids)).slice(0, 50);
  const result = await listProducts({ ids: unique, per_page: unique.length });
  return result.data;
}

export async function searchProductsForPost(
  query: string,
  excludeIds: string[] = []
): Promise<Product[]> {
  const trimmed = query.trim().slice(0, 100);
  if (trimmed.length < 1) return [];
  const result = await listProducts({
    q: trimmed,
    exclude: excludeIds.length > 0 ? excludeIds : undefined,
    per_page: 8,
  });
  return result.data;
}

export async function listAvailableColors(): Promise<ColorOption[]> {
  return apiGetOne<ColorOption[]>('/product-options/colors', {
    revalidate: CATALOG_REVALIDATE,
  });
}
