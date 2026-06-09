import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Currency } from '@commerce/types';
import { SUPABASE_ADMIN } from '../supabase/supabase.module';
import { safeImageSrc } from '../common/safe-image-src';

// CartDisplay mirrors apps/commerce/src/lib/cart/queries.ts. Keeping the same
// flat row shape so the existing CartClient template doesn't need restructuring.

export interface CartItemDisplay {
  id: string;
  quantity: number;
  product_option_id: string;
  color: string;
  color_hex: string | null;
  size_label: string | null;
  sku: string;
  stock: number;
  low_stock_threshold: number;
  additional_price_krw: number;
  additional_price_usd: number;
  additional_price_jpy: number;
  additional_price_eur: number;
  product_id: string;
  product_slug: string;
  product_name_ko: string;
  product_name_en: string;
  product_name_ja: string;
  product_name_de: string;
  product_base_price_krw: number;
  product_base_price_usd: number;
  product_base_price_jpy: number;
  product_base_price_eur: number;
  product_thumbnail_url: string;
}

export interface CartDisplay {
  id: string;
  currency: string;
  items: CartItemDisplay[];
}

@Injectable()
export class CartService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async getForUser(userId: string): Promise<CartDisplay> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: cart } = await (this.supabase.from('carts') as any)
      .select('id, currency')
      .eq('user_id', userId)
      .single();

    if (!cart) return { id: '', currency: 'KRW', items: [] };
    const cartRow = cart as { id: string; currency: string };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawItems } = await (this.supabase.from('cart_items') as any)
      .select(
        `
        id,
        quantity,
        product_option_id,
        product_options!inner (
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
        )
      `
      )
      .eq('cart_id', cartRow.id);
    if (!rawItems) return { id: cartRow.id, currency: cartRow.currency, items: [] };

    const items: CartItemDisplay[] = (rawItems as Record<string, unknown>[]).map((row) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const opt = row.product_options as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prod = opt.products as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const size = opt.sizes as any;
      return {
        id: row.id as string,
        quantity: row.quantity as number,
        product_option_id: row.product_option_id as string,
        color: opt.color as string,
        color_hex: (opt.color_hex as string | null) ?? null,
        size_label: (size?.label as string | null) ?? null,
        sku: opt.sku as string,
        stock: opt.stock as number,
        low_stock_threshold: opt.low_stock_threshold as number,
        additional_price_krw: opt.additional_price_krw as number,
        additional_price_usd: opt.additional_price_usd as number,
        additional_price_jpy: opt.additional_price_jpy as number,
        additional_price_eur: opt.additional_price_eur as number,
        product_id: prod.id as string,
        product_slug: prod.slug as string,
        product_name_ko: prod.name_ko as string,
        product_name_en: prod.name_en as string,
        product_name_ja: prod.name_ja as string,
        product_name_de: prod.name_de as string,
        product_base_price_krw: prod.base_price_krw as number,
        product_base_price_usd: prod.base_price_usd as number,
        product_base_price_jpy: prod.base_price_jpy as number,
        product_base_price_eur: prod.base_price_eur as number,
        product_thumbnail_url: safeImageSrc(prod.thumbnail_url as string),
      };
    });

    return { id: cartRow.id, currency: cartRow.currency, items };
  }

  async addItem(
    userId: string,
    optionId: string,
    quantity: number,
    currency: Currency
  ): Promise<void> {
    // Find or create cart for this user.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingCart } = await (this.supabase.from('carts') as any)
      .select('id')
      .eq('user_id', userId)
      .single();

    let cartId: string;
    if (existingCart) {
      cartId = (existingCart as { id: string }).id;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newCart, error: createError } = await (this.supabase.from('carts') as any)
        .insert({ user_id: userId, currency })
        .select('id')
        .single();
      if (createError || !newCart) throw createError ?? new Error('cart_create_failed');
      cartId = (newCart as { id: string }).id;
    }

    // Increment if line already exists, otherwise insert.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingItem } = await (this.supabase.from('cart_items') as any)
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_option_id', optionId)
      .single();

    if (existingItem) {
      const item = existingItem as { id: string; quantity: number };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.supabase.from('cart_items') as any)
        .update({ quantity: item.quantity + quantity })
        .eq('id', item.id);
      if (error) throw error;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.supabase.from('cart_items') as any).insert({
        cart_id: cartId,
        product_option_id: optionId,
        quantity,
      });
      if (error) throw error;
    }
  }

  async updateItemQuantity(
    userId: string,
    cartItemId: string,
    quantity: number
  ): Promise<void> {
    // Guard: the line must belong to a cart owned by this user. Cheaper than
    // wiring an RLS join — single extra round-trip but the cart UI is rare-write.
    if (!(await this.ownsCartItem(userId, cartItemId))) {
      throw new Error('forbidden');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('cart_items') as any)
      .update({ quantity })
      .eq('id', cartItemId);
    if (error) throw error;
  }

  async removeItem(userId: string, cartItemId: string): Promise<void> {
    if (!(await this.ownsCartItem(userId, cartItemId))) {
      throw new Error('forbidden');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('cart_items') as any)
      .delete()
      .eq('id', cartItemId);
    if (error) throw error;
  }

  private async ownsCartItem(userId: string, cartItemId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('cart_items') as any)
      .select('id, carts!inner(user_id)')
      .eq('id', cartItemId)
      .single();
    if (!data) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const carts = (data as any).carts;
    return carts?.user_id === userId;
  }
}
