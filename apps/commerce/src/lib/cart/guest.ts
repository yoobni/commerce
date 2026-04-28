import type { Currency } from '@commerce/types';

const GUEST_CART_KEY = 'ravi_guest_cart';

interface GuestCartItem {
  option_id: string;
  quantity: number;
  currency: Currency;
}

interface GuestCart {
  items: GuestCartItem[];
}

function readCart(): GuestCart {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return { items: [] };
    return JSON.parse(raw) as GuestCart;
  } catch {
    return { items: [] };
  }
}

function writeCart(cart: GuestCart): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

export function addToGuestCart(optionId: string, quantity: number, currency: Currency): void {
  const cart = readCart();
  const existing = cart.items.find((i) => i.option_id === optionId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ option_id: optionId, quantity, currency });
  }

  writeCart(cart);
}

export function removeFromGuestCart(optionId: string): void {
  const cart = readCart();
  cart.items = cart.items.filter((i) => i.option_id !== optionId);
  writeCart(cart);
}

export function getGuestCart(): GuestCart {
  return readCart();
}

export function clearGuestCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
}
