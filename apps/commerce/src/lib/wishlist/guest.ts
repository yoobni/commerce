'use client';

const WISHLIST_KEY = 'rvc_guest_wishlist';

export function getGuestWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function persist(ids: string[]): string[] {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  return ids;
}

export function toggleGuestWishlist(productId: string): { isWishlisted: boolean } {
  const current = getGuestWishlist();
  const exists = current.includes(productId);
  const next = exists
    ? current.filter((id) => id !== productId)
    : [...current, productId];
  persist(next);
  return { isWishlisted: !exists };
}

export function isGuestWishlisted(productId: string): boolean {
  return getGuestWishlist().includes(productId);
}
