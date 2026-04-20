const GUEST_WISHLIST_KEY = 'ravi_guest_wishlist';

function readWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function writeWishlist(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
}

export function isGuestWishlisted(productId: string): boolean {
  return readWishlist().includes(productId);
}

export function toggleGuestWishlist(productId: string): { isWishlisted: boolean } {
  const ids = readWishlist();
  const idx = ids.indexOf(productId);

  if (idx >= 0) {
    ids.splice(idx, 1);
    writeWishlist(ids);
    return { isWishlisted: false };
  } else {
    ids.push(productId);
    writeWishlist(ids);
    return { isWishlisted: true };
  }
}

export function clearGuestWishlist(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_WISHLIST_KEY);
}
