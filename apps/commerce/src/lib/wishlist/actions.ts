'use server';

import { createClient } from '@/lib/supabase/server';

interface ToggleResult {
  success: boolean;
  isWishlisted: boolean;
  error?: string;
}

interface CheckResult {
  isWishlisted: boolean;
}

export async function toggleWishlistAction(productId: string): Promise<ToggleResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, isWishlisted: false, error: 'not_authenticated' };

  // Check if already wishlisted
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('wishlists') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existing) {
    // Remove from wishlist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('wishlists') as any)
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) return { success: false, isWishlisted: true, error: (error as { message?: string }).message };
    return { success: true, isWishlisted: false };
  } else {
    // Add to wishlist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('wishlists') as any)
      .insert({ user_id: user.id, product_id: productId });

    if (error) return { success: false, isWishlisted: false, error: (error as { message?: string }).message };
    return { success: true, isWishlisted: true };
  }
}

export async function checkWishlistAction(productId: string): Promise<CheckResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isWishlisted: false };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('wishlists') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  return { isWishlisted: !!data };
}
