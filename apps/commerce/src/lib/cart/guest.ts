'use client';

import type { Currency } from '@commerce/types';
import type { GuestCart, GuestCartItem } from './types';

const GUEST_CART_KEY = 'rvc_guest_cart';

function makeDefaultCart(currency: Currency): GuestCart {
  return { items: [], currency, updated_at: new Date().toISOString() };
}

export function getGuestCart(): GuestCart | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestCart;
  } catch {
    return null;
  }
}

function persist(cart: GuestCart): GuestCart {
  const updated: GuestCart = { ...cart, updated_at: new Date().toISOString() };
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
  return updated;
}

export function addToGuestCart(
  product_option_id: string,
  quantity: number,
  currency: Currency
): GuestCart {
  const cart = getGuestCart() ?? makeDefaultCart(currency);
  const existing = cart.items.find(
    (i) => i.product_option_id === product_option_id
  );

  let items: GuestCartItem[];
  if (existing) {
    items = cart.items.map((i) =>
      i.product_option_id === product_option_id
        ? { ...i, quantity: i.quantity + quantity }
        : i
    );
  } else {
    items = [
      ...cart.items,
      { product_option_id, quantity, added_at: new Date().toISOString() },
    ];
  }

  return persist({ ...cart, items });
}

export function removeFromGuestCart(product_option_id: string): GuestCart {
  const cart = getGuestCart() ?? makeDefaultCart('KRW');
  return persist({
    ...cart,
    items: cart.items.filter((i) => i.product_option_id !== product_option_id),
  });
}

export function updateGuestCartQuantity(
  product_option_id: string,
  quantity: number
): GuestCart {
  const cart = getGuestCart() ?? makeDefaultCart('KRW');

  if (quantity <= 0) {
    return removeFromGuestCart(product_option_id);
  }

  return persist({
    ...cart,
    items: cart.items.map((i) =>
      i.product_option_id === product_option_id ? { ...i, quantity } : i
    ),
  });
}

export function clearGuestCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
}

export function getGuestCartCount(): number {
  const cart = getGuestCart();
  if (!cart) return 0;
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}
