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
