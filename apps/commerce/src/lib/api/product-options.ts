'use client';

// Product options API — bulk lookup for guest cart hydration.

import { apiGetOne } from './client';

export interface ProductOptionWithProduct {
  id: string;
  color: string;
  color_hex: string | null;
  sku: string;
  size_label: string | null;
  stock: number;
  low_stock_threshold: number;
  additional_price_krw: number;
  additional_price_usd: number;
  additional_price_jpy: number;
  additional_price_eur: number;
  product: {
    id: string;
    slug: string;
    name_ko: string;
    name_en: string;
    name_ja: string;
    name_de: string;
    base_price_krw: number;
    base_price_usd: number;
    base_price_jpy: number;
    base_price_eur: number;
    thumbnail_url: string;
  };
}

/**
 * Bulk-resolve a set of option ids into display rows. Used by the guest cart
 * to hydrate localStorage entries (id+qty only) into renderable items.
 * Order is preserved.
 */
export async function getOptionsByIds(ids: string[]): Promise<ProductOptionWithProduct[]> {
  if (!ids || ids.length === 0) return [];
  const qs = new URLSearchParams({ ids: ids.join(',') }).toString();
  return apiGetOne<ProductOptionWithProduct[]>(`/product-options?${qs}`, { noStore: true });
}
