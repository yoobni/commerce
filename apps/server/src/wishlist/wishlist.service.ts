import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product, Wishlist } from '@commerce/types';
import { SUPABASE_ADMIN } from '../supabase/supabase.module';
import { safeImageSrc } from '../common/safe-image-src';

export interface WishlistWithProduct extends Wishlist {
  product: Product;
}

function sanitize<T extends { product?: Partial<Product> }>(row: T): T {
  if (!row.product) return row;
  const p = row.product;
  return {
    ...row,
    product: {
      ...p,
      thumbnail_url: safeImageSrc(p.thumbnail_url ?? null),
      images: Array.isArray(p.images) ? p.images.map((s) => safeImageSrc(s)) : p.images,
    } as Product,
  };
}

@Injectable()
export class WishlistService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async listForUser(userId: string): Promise<WishlistWithProduct[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('wishlists') as any)
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as WishlistWithProduct[]).map(sanitize);
  }

  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('wishlists') as any)
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();
    return !!data;
  }

  /** Toggle returns the new state (`isWishlisted` after the operation). */
  async toggle(userId: string, productId: string): Promise<boolean> {
    const exists = await this.isWishlisted(userId, productId);
    if (exists) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.supabase.from('wishlists') as any)
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) throw error;
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('wishlists') as any).insert({
      user_id: userId,
      product_id: productId,
    });
    if (error && (error as { code?: string }).code !== '23505') throw error;
    return true;
  }
}
