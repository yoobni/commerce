'use client';

import type { Currency } from '@commerce/types';
import type { GuestCart, GuestCartItem } from './types';

const GUEST_CART_KEY = 'rvc_guest_cart';
const CART_COUNT_KEY = 'ravi:cart_count';

function makeDefault(currency: Currency): GuestCart {
  return { items: [], currency, updated_at: new Date().toISOString() };
}

export function getGuestCart(): GuestCart | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as GuestCart) : null;
  } catch {
    return null;
  }
}

function persist(cart: GuestCart): GuestCart {
  const updated: GuestCart = { ...cart, updated_at: new Date().toISOString() };
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
  // keep cart count in sync for the header badge
  const count = updated.items.reduce((s, i) => s + i.quantity, 0);
  localStorage.setItem(CART_COUNT_KEY, String(count));
  return updated;
}

export function addToGuestCart(
  product_option_id: string,
  quantity: number,
  currency: Currency
): GuestCart {
  const cart = getGuestCart() ?? makeDefault(currency);
  const existing = cart.items.find((i) => i.product_option_id === product_option_id);

  const items: GuestCartItem[] = existing
    ? cart.items.map((i) =>
        i.product_option_id === product_option_id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      )
    : [
        ...cart.items,
        { product_option_id, quantity, added_at: new Date().toISOString() },
      ];

  return persist({ ...cart, items });
}

export function getGuestCartCount(): number {
  const cart = getGuestCart();
  if (!cart) return 0;
  return cart.items.reduce((s, i) => s + i.quantity, 0);
}
