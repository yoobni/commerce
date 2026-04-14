/**
 * Search queries — Supabase Server Component direct queries.
 * Uses ILIKE with pg_trgm index for localized product name/description search.
 */

import type { Product, PaginatedResponse, SearchProductsParams, SearchSuggestion, Locale } from '@commerce/types';
import { createClient } from '../supabase/server';

const SORT_MAP: Record<
  NonNullable<SearchProductsParams['sort']>,
  { column: string; ascending: boolean }
> = {
  relevance:  { column: 'view_count',     ascending: false },
  newest:     { column: 'created_at',     ascending: false },
  price_asc:  { column: 'base_price_krw', ascending: true  },
  price_desc: { column: 'base_price_krw', ascending: false },
  popular:    { column: 'view_count',     ascending: false },
};

function getNameColumn(locale: Locale): string {
  switch (locale) {
    case 'ko': return 'name_ko';
    case 'ja': return 'name_ja';
    case 'de': return 'name_de';
    default:   return 'name_en';
  }
}

function getDescColumn(locale: Locale): string {
  switch (locale) {
    case 'ko': return 'description_ko';
    case 'ja': return 'description_ja';
    case 'de': return 'description_de';
    default:   return 'description_en';
  }
}

export async function searchProducts(
  params: SearchProductsParams
): Promise<PaginatedResponse<Product>> {
  const {
    query,
    locale = 'en',
    sort = 'relevance',
    page = 1,
    per_page = 20,
  } = params;

  const trimmed = query.trim();
  if (!trimmed) return { data: [], total: 0, page, per_page, has_next: false };

  const supabase = await createClient();
  const offset = (page - 1) * per_page;
  const nameCol = getNameColumn(locale);
  const descCol = getDescColumn(locale);
  const pattern = `%${trimmed}%`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (supabase.from('products') as any)
    .select('*', { count: 'exact' })
    .eq('status', 'ACTIVE')
    .or(`${nameCol}.ilike.${pattern},${descCol}.ilike.${pattern}`)
    .order(SORT_MAP[sort].column, { ascending: SORT_MAP[sort].ascending })
    .range(offset, offset + per_page - 1);

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

/**
 * Returns up to `limit` product name suggestions for autocomplete.
 * Matches against the localized name column only (fast trigram lookup).
 */
export async function searchSuggestions(
  query: string,
  locale: Locale = 'en',
  limit = 5
): Promise<SearchSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const supabase = await createClient();
  const nameCol = getNameColumn(locale);
  const pattern = `%${trimmed}%`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('products') as any)
    .select(`id, slug, ${nameCol}, thumbnail_url`)
    .eq('status', 'ACTIVE')
    .ilike(nameCol, pattern)
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as Array<Record<string, string>>).map((row) => ({
    product_id: row.id,
    name: row[nameCol],
    slug: row.slug,
    thumbnail_url: row.thumbnail_url,
  }));
}
