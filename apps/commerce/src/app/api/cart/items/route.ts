import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface AddCartItemBody {
  product_option_id: string;
  quantity?: number;
}

export async function POST(request: NextRequest) {
  let body: AddCartItemBody;
  try {
    body = (await request.json()) as AddCartItemBody;
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  const { product_option_id, quantity = 1 } = body;

  if (!product_option_id) {
    return NextResponse.json(
      { error: { code: 'MISSING_PARAMS', message: 'product_option_id is required' } },
      { status: 400 }
    );
  }

  if (quantity < 1 || quantity > 99) {
    return NextResponse.json(
      { error: { code: 'INVALID_QUANTITY', message: 'Quantity must be between 1 and 99' } },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  // ── Get or create cart ────────────────────────────────────────────────────────
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
    const { data: newCart, error: cartError } = await (supabase.from('carts') as any)
      .insert({ user_id: user.id, currency: 'KRW' })
      .select('id')
      .single();

    if (cartError || !newCart) {
      console.error('[cart/items] Failed to create cart:', cartError);
      return NextResponse.json(
        { error: { code: 'CART_CREATE_FAILED', message: 'Failed to create cart' } },
        { status: 500 }
      );
    }
    cartId = (newCart as { id: string }).id;
  }

  // ── Upsert cart item ──────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingItem } = await (supabase.from('cart_items') as any)
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_option_id', product_option_id)
    .single();

  if (existingItem) {
    const item = existingItem as { id: string; quantity: number };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('cart_items') as any)
      .update({ quantity: item.quantity + quantity, updated_at: new Date().toISOString() })
      .eq('id', item.id);

    if (error) {
      console.error('[cart/items] Failed to update cart item:', error);
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: 'Failed to update cart item' } },
        { status: 500 }
      );
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('cart_items') as any)
      .insert({ cart_id: cartId, product_option_id, quantity });

    if (error) {
      console.error('[cart/items] Failed to insert cart item:', error);
      return NextResponse.json(
        { error: { code: 'INSERT_FAILED', message: 'Failed to add item to cart' } },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ data: { success: true }, error: null });
}
