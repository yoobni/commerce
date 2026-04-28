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

export function updateGuestCartItemQuantity(optionId: string, quantity: number): void {
  const cart = readCart();
  const item = cart.items.find((i) => i.option_id === optionId);
  if (item) {
    item.quantity = quantity;
    writeCart(cart);
  }
}

export function clearGuestCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
}

export function getGuestCartItemCount(): number {
  return readCart().items.reduce((sum, i) => sum + i.quantity, 0);
}

const CART_COUNT_KEY = 'ravi_cart_count';

export function setCartCountCache(count: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_COUNT_KEY, String(count));
  window.dispatchEvent(new CustomEvent('ravi:cart-count', { detail: count }));
}

export function getCartCountCache(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(CART_COUNT_KEY) ?? '0', 10) || 0;
}
