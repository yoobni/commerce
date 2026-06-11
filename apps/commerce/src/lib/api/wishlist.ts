import type { Wishlist, Product } from '@commerce/types';
import { apiGetOne } from './client';
import { getAccessToken } from './auth';

export interface WishlistWithProduct extends Wishlist {
  product: Product;
}

/** Server-side: returns the authenticated viewer's wishlist, or [] anonymous. */
export async function listUserWishlist(): Promise<WishlistWithProduct[]> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) return [];
  return apiGetOne<WishlistWithProduct[]>('/wishlist/me', {
    accessToken,
    noStore: true,
  });
}

/**
 * Server-side bulk wishlist hydration — given a page's product list, returns
 * the subset of ids the viewer has wishlisted. Replaces the N+1 pattern of
 * one /wishlist/me/products/:id call per ProductCard.
 *
 * Returns an empty Set for anonymous viewers.
 */
export async function getWishlistedIds(productIds: string[]): Promise<Set<string>> {
  if (productIds.length === 0) return new Set();
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) return new Set();
  try {
    const res = await apiGetOne<{ wishlisted_ids: string[] }>(
      `/wishlist/me/products?ids=${productIds.join(',')}`,
      { accessToken, noStore: true }
    );
    return new Set(res.wishlisted_ids);
  } catch {
    // Heart hydration is non-critical — fall back to "none wishlisted" so
    // the page still renders. The first user toggle will fix state.
    return new Set();
  }
}
