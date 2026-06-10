import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON } from '../supabase/supabase.module';

export interface ColorOption {
  name: string;
  hex: string;
}

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

// Cap the bulk lookup so a runaway query string can't flood the URL.
const MAX_IDS_PER_LOOKUP = 100;

// Catalog-level views over product_options.
// Distinct from ProductsService because they're cross-product aggregations
// (e.g. "all colors any active option supports"), not per-product reads.

@Injectable()
export class ProductOptionsService {
  constructor(@Inject(SUPABASE_ANON) private readonly supabase: SupabaseClient) {}

  async listColors(): Promise<ColorOption[]> {
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

  /**
   * Resolve a set of option ids into display rows joined with their parent
   * product. Used by the guest cart on the client to hydrate localStorage
   * cart entries (`option_id` only) into renderable items.
   *
   * Order of the input `ids` is preserved in the response.
   */
  async getByIds(ids: string[]): Promise<ProductOptionWithProduct[]> {
    if (!ids || ids.length === 0) return [];
    const capped = ids.slice(0, MAX_IDS_PER_LOOKUP);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('product_options') as any)
      .select(
        `
        id,
        color,
        color_hex,
        sku,
        additional_price_krw,
        additional_price_usd,
        additional_price_jpy,
        additional_price_eur,
        stock,
        low_stock_threshold,
        sizes ( label ),
        products!inner (
          id,
          slug,
          name_ko,
          name_en,
          name_ja,
          name_de,
          base_price_krw,
          base_price_usd,
          base_price_jpy,
          base_price_eur,
          thumbnail_url
        )
      `
      )
      .in('id', capped);

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (data as any[]).map((opt) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prod = opt.products as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const size = opt.sizes as any;
      return {
        id: opt.id as string,
        color: opt.color as string,
        color_hex: (opt.color_hex as string | null) ?? null,
        sku: opt.sku as string,
        size_label: (size?.label as string | null) ?? null,
        stock: opt.stock as number,
        low_stock_threshold: opt.low_stock_threshold as number,
        additional_price_krw: opt.additional_price_krw as number,
        additional_price_usd: opt.additional_price_usd as number,
        additional_price_jpy: opt.additional_price_jpy as number,
        additional_price_eur: opt.additional_price_eur as number,
        product: {
          id: prod.id as string,
          slug: prod.slug as string,
          name_ko: prod.name_ko as string,
          name_en: prod.name_en as string,
          name_ja: prod.name_ja as string,
          name_de: prod.name_de as string,
          base_price_krw: prod.base_price_krw as number,
          base_price_usd: prod.base_price_usd as number,
          base_price_jpy: prod.base_price_jpy as number,
          base_price_eur: prod.base_price_eur as number,
          thumbnail_url: prod.thumbnail_url as string,
        },
      };
    });

    const byId = new Map(rows.map((r) => [r.id, r] as const));
    return capped.map((id) => byId.get(id)).filter((r): r is ProductOptionWithProduct => !!r);
  }
}
