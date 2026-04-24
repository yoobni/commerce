import type { Wishlist } from '@commerce/types';
import { createClient } from '../supabase/server';

export interface WishlistWithProduct extends Wishlist {
  product: import('@commerce/types').Product;
}

export async function listUserWishlist(userId: string): Promise<WishlistWithProduct[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('wishlists') as any)
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as WishlistWithProduct[];
}
