'use server';

import { createServerSupabase } from '@/lib/supabase';
import { AppError } from '@/lib/errors';
import type { UUID, Currency, Cart } from '@commerce/types';

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function getUserId(): Promise<UUID> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw AppError.unauthorized('Login required');
  return user.id as UUID;
}

async function getOrCreateCart(userId: UUID, currency: Currency): Promise<Cart> {
  const supabase = await createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing, error: fetchErr } = await (supabase.from('carts') as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchErr) throw new AppError('Failed to fetch cart', 'UNKNOWN', 500);
  if (existing) return existing as Cart;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: created, error: createErr } = await (supabase.from('carts') as any)
    .insert({ user_id: userId, currency })
    .select()
    .single();

  if (createErr || !created) throw new AppError('Failed to create cart', 'UNKNOWN', 500);
  return created as Cart;
}

// ─── Public Server Actions ────────────────────────────────────────────────────

/**
 * Add an item to the authenticated user's cart.
 * Increments quantity if the option already exists.
 * Returns: { success: true } | { success: false; code: string }
 */
export async function addToCartAction(
  productOptionId: UUID,
  quantity: number,
  currency: Currency
): Promise<{ success: boolean; code?: string }> {
  try {
    const userId = await getUserId();
    const cart = await getOrCreateCart(userId, currency);
    const supabase = await createServerSupabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from('cart_items') as any)
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_option_id', productOptionId)
      .maybeSingle();

    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('cart_items') as any)
        .update({ quantity: (existing as { id: string; quantity: number }).quantity + quantity })
        .eq('id', (existing as { id: string }).id);
      if (error) throw error;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('cart_items') as any)
        .insert({ cart_id: cart.id, product_option_id: productOptionId, quantity });
      if (error) throw error;
    }

    return { success: true };
  } catch (err) {
    if (err instanceof AppError && err.code === 'UNAUTHORIZED') {
      return { success: false, code: 'UNAUTHORIZED' };
    }
    return { success: false, code: 'UNKNOWN' };
  }
}
