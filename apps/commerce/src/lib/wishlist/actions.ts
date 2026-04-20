'use server';

import { createServerSupabase } from '@/lib/supabase';
import { AppError } from '@/lib/errors';
import type { UUID } from '@commerce/types';

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function getAuthUser(): Promise<{ id: UUID } | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id as UUID } : null;
}

// ─── Public Server Actions ────────────────────────────────────────────────────

export async function toggleWishlistAction(
  productId: UUID
): Promise<{ success: boolean; isWishlisted: boolean; code?: string }> {
  try {
    const user = await getAuthUser();
    if (!user) throw AppError.unauthorized();

    const supabase = await createServerSupabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from('wishlists') as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('wishlists') as any)
        .delete()
        .eq('id', (existing as { id: string }).id);
      if (error) throw error;
      return { success: true, isWishlisted: false };
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('wishlists') as any)
        .insert({ user_id: user.id, product_id: productId });
      if (error) throw error;
      return { success: true, isWishlisted: true };
    }
  } catch (err) {
    if (err instanceof AppError && err.code === 'UNAUTHORIZED') {
      return { success: false, isWishlisted: false, code: 'UNAUTHORIZED' };
    }
    return { success: false, isWishlisted: false, code: 'UNKNOWN' };
  }
}

export async function checkWishlistAction(
  productId: UUID
): Promise<{ isWishlisted: boolean }> {
  try {
    const user = await getAuthUser();
    if (!user) return { isWishlisted: false };

    const supabase = await createServerSupabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('wishlists') as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    return { isWishlisted: !!data };
  } catch {
    return { isWishlisted: false };
  }
}
