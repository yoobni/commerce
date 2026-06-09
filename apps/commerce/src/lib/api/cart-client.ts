'use client';

// Client-side cart mutations.

import type { Currency } from '@commerce/types';
import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import { apiDelete, apiPatch, apiPost } from './client';
import type { CartDisplay } from './cart';

async function browserToken(): Promise<string | undefined> {
  const supabase = createBrowserSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

/** Add a product option to the cart. Returns the refreshed cart for re-render. */
export async function addToCart(
  optionId: string,
  quantity: number,
  currency: Currency
): Promise<CartDisplay> {
  return apiPost<CartDisplay>('/cart/me/items', {
    accessToken: await browserToken(),
    body: { option_id: optionId, quantity, currency },
  });
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<void> {
  await apiPatch<{ id: string }>(
    `/cart/me/items/${encodeURIComponent(cartItemId)}`,
    {
      accessToken: await browserToken(),
      body: { quantity },
    }
  );
}

export async function removeCartItem(cartItemId: string): Promise<void> {
  await apiDelete(`/cart/me/items/${encodeURIComponent(cartItemId)}`, {
    accessToken: await browserToken(),
  });
}
