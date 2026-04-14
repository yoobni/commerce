'use server';

import { createServerSupabase } from '@/lib/supabase';
import { AppError } from '@/lib/errors';
import type { UUID, Currency, CartItem, Cart } from '@commerce/types';
import type { GuestCartItem } from './types';

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

  const { data: existing, error: fetchErr } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchErr) throw new AppError('Failed to fetch cart', 'UNKNOWN', 500);
  if (existing) return existing as Cart;

  const { data: created, error: createErr } = await supabase
    .from('carts')
    .insert({ user_id: userId, currency })
    .select()
    .single();

  if (createErr || !created) throw new AppError('Failed to create cart', 'UNKNOWN', 500);
  return created as Cart;
}

async function getCartId(userId: UUID): Promise<UUID | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? (data.id as UUID) : null;
}

// ─── Public Server Actions ────────────────────────────────────────────────────

/**
 * Add an item to the authenticated user's cart.
 * Increments quantity if the option already exists.
 */
export async function addToCartAction(
  productOptionId: UUID,
  quantity: number,
  currency: Currency
): Promise<void> {
  const userId = await getUserId();
  const cart = await getOrCreateCart(userId, currency);
  const supabase = await createServerSupabase();

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cart.id)
    .eq('product_option_id', productOptionId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({
        quantity: (existing.quantity as number) + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) throw new AppError('Failed to update cart item', 'UNKNOWN', 500);
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ cart_id: cart.id, product_option_id: productOptionId, quantity });
    if (error) throw new AppError('Failed to add cart item', 'UNKNOWN', 500);
  }
}

/**
 * Remove an item from the authenticated user's cart.
 */
export async function removeFromCartAction(productOptionId: UUID): Promise<void> {
  const userId = await getUserId();
  const cartId = await getCartId(userId);
  if (!cartId) return;

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
    .eq('product_option_id', productOptionId);

  if (error) throw new AppError('Failed to remove cart item', 'UNKNOWN', 500);
}

/**
 * Update item quantity. Removes the item when quantity <= 0.
 */
export async function updateCartQuantityAction(
  productOptionId: UUID,
  quantity: number
): Promise<void> {
  if (quantity <= 0) {
    return removeFromCartAction(productOptionId);
  }

  const userId = await getUserId();
  const cartId = await getCartId(userId);
  if (!cartId) return;

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('cart_id', cartId)
    .eq('product_option_id', productOptionId);

  if (error) throw new AppError('Failed to update cart quantity', 'UNKNOWN', 500);
}

/**
 * Fetch cart items with enriched product + option details.
 * Used by the cart page server component.
 */
export async function getMemberCartItemsAction(): Promise<CartItem[]> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const cartId = await getCartId(user.id as UUID);
  if (!cartId) return [];

  const { data, error } = await supabase
    .from('cart_items')
    .select(
      `
      id,
      cart_id,
      product_option_id,
      quantity,
      created_at,
      updated_at,
      product_option:product_options (
        id,
        product_id,
        size_id,
        color,
        color_hex,
        sku,
        additional_price_krw,
        additional_price_usd,
        additional_price_jpy,
        additional_price_eur,
        stock,
        low_stock_threshold,
        is_active,
        created_at,
        updated_at,
        product:products (
          id,
          category_id,
          slug,
          name_ko,
          name_en,
          name_ja,
          name_de,
          base_price_krw,
          base_price_usd,
          base_price_jpy,
          base_price_eur,
          thumbnail_url,
          images,
          status
        )
      )
    `
    )
    .eq('cart_id', cartId)
    .order('created_at', { ascending: true });

  if (error) throw new AppError('Failed to fetch cart items', 'UNKNOWN', 500);
  return (data ?? []) as unknown as CartItem[];
}

/**
 * Merge guest cart items into the authenticated user's cart.
 * Called immediately after login.
 */
export async function mergeGuestCartAction(
  guestItems: GuestCartItem[],
  currency: Currency
): Promise<void> {
  if (guestItems.length === 0) return;

  const userId = await getUserId();
  const cart = await getOrCreateCart(userId, currency);
  const supabase = await createServerSupabase();

  for (const guestItem of guestItems) {
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_option_id', guestItem.product_option_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({
          quantity: (existing.quantity as number) + guestItem.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        cart_id: cart.id,
        product_option_id: guestItem.product_option_id,
        quantity: guestItem.quantity,
      });
    }
  }
}

/**
 * Delete all items from the authenticated user's cart.
 */
export async function clearMemberCartAction(): Promise<void> {
  const userId = await getUserId();
  const cartId = await getCartId(userId);
  if (!cartId) return;

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);

  if (error) throw new AppError('Failed to clear cart', 'UNKNOWN', 500);
}
