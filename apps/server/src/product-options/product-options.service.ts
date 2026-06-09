import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON } from '../supabase/supabase.module';

export interface ColorOption {
  name: string;
  hex: string;
}

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
}
