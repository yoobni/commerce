'use server';

import { createClient } from '@/lib/supabase/server';
import type { Currency } from '@commerce/types';

export async function updateCartItemQuantityAction(
  cartItemId: string,
  quantity: number
): Promise<{ success: boolean; error?: string }> {
  if (quantity < 1) return { success: false, error: 'invalid_quantity' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('cart_items') as any)
    .update({ quantity })
    .eq('id', cartItemId);

  if (error) return { success: false, error: (error as { message?: string }).message };
  return { success: true };
}

export async function removeCartItemAction(
  cartItemId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('cart_items') as any)
    .delete()
    .eq('id', cartItemId);

  if (error) return { success: false, error: (error as { message?: string }).message };
  return { success: true };
}

interface CartActionResult {
  success: boolean;
  error?: string;
}

export async function addToCartAction(
  optionId: string,
  quantity: number,
  currency: Currency
): Promise<CartActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'not_authenticated' };

  // Find or create cart for this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingCart } = await (supabase.from('carts') as any)
    .select('id')
    .eq('user_id', user.id)
    .single();

  let cartId: string;

  if (existingCart) {
    cartId = (existingCart as { id: string }).id;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newCart, error: createError } = await (supabase.from('carts') as any)
      .insert({ user_id: user.id, currency })
      .select('id')
      .single();

    if (createError || !newCart) {
      return { success: false, error: (createError as { message?: string } | null)?.message ?? 'cart_create_failed' };
    }
    cartId = (newCart as { id: string }).id;
  }

  // Check if item already in cart → increment, else insert
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingItem } = await (supabase.from('cart_items') as any)
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_option_id', optionId)
    .single();

  if (existingItem) {
    const item = existingItem as { id: string; quantity: number };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('cart_items') as any)
      .update({ quantity: item.quantity + quantity })
      .eq('id', item.id);
    if (error) return { success: false, error: (error as { message?: string }).message };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('cart_items') as any)
      .insert({ cart_id: cartId, product_option_id: optionId, quantity });
    if (error) return { success: false, error: (error as { message?: string }).message };
  }

  return { success: true };
}
