'use client';

// Client-side wishlist mutations + check. Used by WishlistButton.

import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import { apiGetOne, apiPost } from './client';

async function browserToken(): Promise<string | undefined> {
  const supabase = createBrowserSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export async function checkWishlist(productId: string): Promise<boolean> {
  const accessToken = await browserToken();
  if (!accessToken) return false;
  const res = await apiGetOne<{ is_wishlisted: boolean }>(
    `/wishlist/me/products/${encodeURIComponent(productId)}`,
    { accessToken, noStore: true }
  );
  return res.is_wishlisted;
}

export async function toggleWishlist(productId: string): Promise<boolean> {
  const accessToken = await browserToken();
  if (!accessToken) throw new Error('unauthorized');
  const res = await apiPost<{ is_wishlisted: boolean }>('/wishlist/me/toggle', {
    accessToken,
    body: { product_id: productId },
  });
  return res.is_wishlisted;
}
