'use client';

// Client-side wishlist mutations + check. Used by WishlistButton.

import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import { apiGetOne, apiPost } from './client';

async function browserToken(): Promise<string | undefined> {
  try {
    const supabase = createBrowserSupabase();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.warn('[wishlist] supabase.auth.getSession error:', error);
      return undefined;
    }
    return session?.access_token;
  } catch (e) {
    console.warn('[wishlist] browserToken threw:', e);
    return undefined;
  }
}

export type ToggleResult =
  | { ok: true; is_wishlisted: boolean }
  | { ok: false; reason: 'unauthorized' | 'network'; error?: unknown };

export async function checkWishlist(productId: string): Promise<boolean> {
  const accessToken = await browserToken();
  if (!accessToken) return false;
  try {
    const res = await apiGetOne<{ is_wishlisted: boolean }>(
      `/wishlist/me/products/${encodeURIComponent(productId)}`,
      { accessToken, noStore: true }
    );
    return res.is_wishlisted;
  } catch (e) {
    console.warn('[wishlist] checkWishlist failed:', e);
    return false;
  }
}

export async function toggleWishlist(productId: string): Promise<ToggleResult> {
  const accessToken = await browserToken();
  if (!accessToken) {
    console.warn('[wishlist] no browser session — toggle skipped');
    return { ok: false, reason: 'unauthorized' };
  }
  try {
    const res = await apiPost<{ is_wishlisted: boolean }>('/wishlist/me/toggle', {
      accessToken,
      body: { product_id: productId },
    });
    return { ok: true, is_wishlisted: res.is_wishlisted };
  } catch (e) {
    console.warn('[wishlist] toggleWishlist failed:', e);
    return { ok: false, reason: 'network', error: e };
  }
}
