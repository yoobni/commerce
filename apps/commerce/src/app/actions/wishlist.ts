'use server';

import { createClient } from '@/lib/supabase/server';
import { toggleWishlist } from '@/lib/queries/wishlist';

export interface ToggleWishlistResult {
  action: 'add' | 'remove';
  error: null;
}
export interface ToggleWishlistError {
  action: null;
  error: 'unauthenticated' | 'server_error';
}

export async function toggleWishlistAction(
  productId: string
): Promise<ToggleWishlistResult | ToggleWishlistError> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { action: null, error: 'unauthenticated' };
  }

  try {
    const result = await toggleWishlist(user.id, productId);
    return { action: result.action, error: null };
  } catch {
    return { action: null, error: 'server_error' };
  }
}
