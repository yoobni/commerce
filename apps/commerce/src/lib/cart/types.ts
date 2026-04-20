import type { Currency } from '@commerce/types';

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
