import type { Currency, CartItem } from '@commerce/types';

// ─── Guest Cart (localStorage) ────────────────────────────────────────────────

export interface GuestCartItem {
  product_option_id: string;
  quantity: number;
  added_at: string;
}

export interface GuestCart {
  items: GuestCartItem[];
  currency: Currency;
  updated_at: string;
}

// ─── Price Calculation ────────────────────────────────────────────────────────

/** Minimal shape required for price calculation */
export interface CartLineItem {
  product: {
    base_price_krw: number;
    base_price_usd: number;
    base_price_jpy: number;
    base_price_eur: number;
  };
  option: {
    additional_price_krw: number;
    additional_price_usd: number;
    additional_price_jpy: number;
    additional_price_eur: number;
  };
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
}

export interface CartSummary extends CartTotals {
  items: CartItem[];
  item_count: number;
  currency: Currency;
}
