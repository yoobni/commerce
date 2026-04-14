/**
 * Wishlist queries — Supabase Server Component direct queries.
 * All functions require an authenticated user_id.
 */

import type { Wishlist } from '@commerce/types';
import { createClient } from '../supabase/server';

/** Full wishlist with resolved product relations, sorted by most recently added */
export async function getUserWishlist(userId: string): Promise<Wishlist[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('wishlists')
    .select('*, product:products(*)')
    .eq('user_id', userId)
    .order('wishlist_added_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Wishlist[];
}

/** Lightweight set of product IDs — used by PLP to mark wishlisted cards */
export async function getWishlistProductIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set((data ?? []).map((r: { product_id: string }) => r.product_id));
}

/**
 * Toggle wishlist membership for (userId, productId).
 * Returns the action taken so the caller can fire the correct analytics event.
 */
export async function toggleWishlist(
  userId: string,
  productId: string
): Promise<{ action: 'add' | 'remove' }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
    return { action: 'remove' };
  }

  const { error } = await supabase.from('wishlists').insert({
    user_id: userId,
    product_id: productId,
    wishlist_added_at: new Date().toISOString(),
  });
  if (error) throw error;
  return { action: 'add' };
}
