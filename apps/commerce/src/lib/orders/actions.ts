'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Currency, Locale } from '@commerce/types';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CreateOrderInput {
  cartId: string;
  // Saved address ID — if null, a new address record is created from the fields below
  savedAddressId: string | null;
  recipient: string;
  phone: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  deliveryNote: string;
  // Payment
  paymentMethod: 'CARD' | 'KAKAO_PAY' | 'NAVER_PAY' | 'TOSS_PAY';
  currency: Currency;
  locale: Locale;
  // Optional
  couponCode: string | null;
  pointAmount: number;
}

export interface CreateOrderResult {
  success: true;
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  currency: Currency;
}

export interface CreateOrderError {
  success: false;
  error: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Toss orderId constraint: 6–64 chars, [a-zA-Z0-9_-] */
function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${date}-${rand}`;
}

function getPriceForCurrency(
  item: {
    base_price_krw: number; base_price_usd: number;
    base_price_jpy: number; base_price_eur: number;
    additional_price_krw: number; additional_price_usd: number;
    additional_price_jpy: number; additional_price_eur: number;
  },
  currency: Currency
): number {
  const base =
    currency === 'KRW' ? item.base_price_krw
    : currency === 'USD' ? item.base_price_usd
    : currency === 'JPY' ? item.base_price_jpy
    : item.base_price_eur;
  const extra =
    currency === 'KRW' ? item.additional_price_krw
    : currency === 'USD' ? item.additional_price_usd
    : currency === 'JPY' ? item.additional_price_jpy
    : item.additional_price_eur;
  return base + extra;
}

function getShippingFee(subtotal: number, currency: Currency): number {
  const thresholds: Record<Currency, number> = { KRW: 50000, USD: 50, JPY: 7000, EUR: 50 };
  const fees: Record<Currency, number> = { KRW: 3000, USD: 10, JPY: 1000, EUR: 8 };
  return subtotal >= thresholds[currency] ? 0 : fees[currency];
}

// ─── createOrderAction ─────────────────────────────────────────────────────

/**
 * Creates an order from the current cart.
 *
 * Flow:
 *  1. Auth check
 *  2. Fetch cart items with stock
 *  3. Validate stock per item
 *  4. Validate + apply coupon (DB lookup)
 *  5. Calculate subtotal / shipping / discount / total
 *  6. Resolve address (use savedAddressId or create new record)
 *  7. Insert order → order_items → payment(PENDING)
 *  8. Decrement stock (optimistic; DB check constraint is the real guard)
 *  9. Return orderId + orderNumber for Toss SDK redirect
 *
 * Cart is NOT cleared here — cleared only after Toss payment success
 * so users can retry on failure.
 */
export async function createOrderAction(
  input: CreateOrderInput
): Promise<CreateOrderResult | CreateOrderError> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { success: false, error: 'not_authenticated' };
  const userId = authData.user.id;

  // ── 1. Fetch cart items ──────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawItems, error: cartError } = await (supabase as any)
    .from('cart_items')
    .select(`
      id, quantity, product_option_id,
      product_options!inner (
        color, sku, stock,
        additional_price_krw, additional_price_usd,
        additional_price_jpy, additional_price_eur,
        sizes ( label ),
        products!inner (
          id, name_ko, name_en, thumbnail_url,
          base_price_krw, base_price_usd,
          base_price_jpy, base_price_eur
        )
      )
    `)
    .eq('cart_id', input.cartId);

  if (cartError) return { success: false, error: 'cart_fetch_failed' };
  if (!rawItems || (rawItems as unknown[]).length === 0) {
    return { success: false, error: 'cart_empty' };
  }

  // ── 2. Map items + stock check ────────────────────────────────────────────
  interface MappedItem {
    cartItemId: string;
    productOptionId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    sku: string;
    stock: number;
    productId: string;
    productName: string;
    thumbnailUrl: string;
    color: string;
    sizeLabel: string | null;
  }

  const mappedItems: MappedItem[] = [];
  for (const row of rawItems as Record<string, unknown>[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opt = row.product_options as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prod = opt.products as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sizeObj = opt.sizes as any;
    const qty = row.quantity as number;
    const stock = opt.stock as number;

    if (qty > stock) return { success: false, error: 'out_of_stock' };

    const unitPrice = getPriceForCurrency(
      {
        base_price_krw: prod.base_price_krw,
        base_price_usd: prod.base_price_usd,
        base_price_jpy: prod.base_price_jpy,
        base_price_eur: prod.base_price_eur,
        additional_price_krw: opt.additional_price_krw,
        additional_price_usd: opt.additional_price_usd,
        additional_price_jpy: opt.additional_price_jpy,
        additional_price_eur: opt.additional_price_eur,
      },
      input.currency
    );

    mappedItems.push({
      cartItemId: row.id as string,
      productOptionId: row.product_option_id as string,
      quantity: qty,
      unitPrice,
      totalPrice: unitPrice * qty,
      sku: opt.sku as string,
      stock,
      productId: prod.id as string,
      productName: input.locale === 'ko' ? prod.name_ko : prod.name_en,
      thumbnailUrl: prod.thumbnail_url as string,
      color: opt.color as string,
      sizeLabel: (sizeObj?.label as string | null) ?? null,
    });
  }

  // ── 3. Coupon validation ─────────────────────────────────────────────────
  let discountAmount = 0;
  let couponIssuanceId: string | null = null;

  if (input.couponCode) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: issuanceData } = await (supabase as any)
      .from('coupon_issuances')
      .select(`
        id, status, expires_at,
        coupons!inner (
          code, type, discount_value, max_discount_amount,
          min_order_amount, status, starts_at, expires_at
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'ISSUED')
      .limit(50); // fetch user's issued coupons then find matching code

    if (issuanceData) {
      const now = new Date();
      for (const issuance of issuanceData as Record<string, unknown>[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const coupon = (issuance as any).coupons as any;
        if (!coupon) continue;
        if ((coupon.code as string).toUpperCase() !== input.couponCode.toUpperCase()) continue;
        if (coupon.status !== 'ACTIVE') continue;
        if (new Date(coupon.starts_at as string) > now) continue;
        if (new Date(coupon.expires_at as string) < now) continue;
        if (new Date((issuance as { expires_at: string }).expires_at) < now) continue;

        const subtotalForCoupon = mappedItems.reduce((s, i) => s + i.totalPrice, 0);
        const minOrder = coupon.min_order_amount as number | null;
        if (minOrder && subtotalForCoupon < minOrder) continue;

        if ((coupon.type as string) === 'PERCENTAGE') {
          const raw = Math.floor(subtotalForCoupon * ((coupon.discount_value as number) / 100));
          const max = coupon.max_discount_amount as number | null;
          discountAmount = max ? Math.min(raw, max) : raw;
        } else {
          discountAmount = coupon.discount_value as number;
        }
        couponIssuanceId = (issuance as { id: string }).id;
        break;
      }
    }
  }

  // ── 4. Calculate totals ──────────────────────────────────────────────────
  const subtotal = mappedItems.reduce((s, i) => s + i.totalPrice, 0);
  const shippingFee = getShippingFee(subtotal, input.currency);
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount - input.pointAmount);

  // ── 5. Resolve address ID (admin client for writes) ──────────────────────
  const admin = createAdminClient();
  let resolvedAddressId: string;

  if (input.savedAddressId) {
    resolvedAddressId = input.savedAddressId;
  } else {
    // Create a new address record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newAddr, error: addrError } = await (admin as any)
      .from('addresses')
      .insert({
        user_id: userId,
        recipient_name: input.recipient,
        phone: input.phone,
        country: input.currency === 'KRW' ? 'KR'
          : input.currency === 'USD' ? 'US'
          : input.currency === 'JPY' ? 'JP' : 'DE',
        postal_code: input.postalCode,
        city: input.addressLine1.split(' ')[0] ?? 'Unknown', // best-effort city extraction
        address_line1: input.addressLine1,
        address_line2: input.addressLine2 || null,
        is_default: false,
      })
      .select('id')
      .single();

    if (addrError || !newAddr) {
      return { success: false, error: 'address_create_failed' };
    }
    resolvedAddressId = (newAddr as { id: string }).id;
  }

  // ── 6. Insert order ──────────────────────────────────────────────────────
  const orderNumber = generateOrderNumber();
  const shippingSnapshot = {
    recipient_name: input.recipient,
    phone: input.phone,
    postal_code: input.postalCode,
    address_line1: input.addressLine1,
    address_line2: input.addressLine2 || null,
    delivery_note: input.deliveryNote || null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderError } = await (admin as any)
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: userId,
      address_id: resolvedAddressId,
      shipping_address_snapshot: shippingSnapshot,
      currency: input.currency,
      subtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      tax_amount: 0,
      total_amount: totalAmount,
      coupon_issuance_id: couponIssuanceId,
      point_used: input.pointAmount,
      status: 'PENDING_PAYMENT',
    })
    .select('id')
    .single();

  if (orderError || !order) {
    return { success: false, error: `order_create_failed` };
  }
  const orderId = (order as { id: string }).id;

  // ── 7. Insert order_items ────────────────────────────────────────────────
  const orderItemRows = mappedItems.map((item) => ({
    order_id: orderId,
    product_option_id: item.productOptionId,
    product_snapshot: {
      product_id: item.productId,
      product_option_id: item.productOptionId,
      name: item.productName,
      sku: item.sku,
      thumbnail_url: item.thumbnailUrl,
      size: item.sizeLabel ?? '',
      color: item.color,
    },
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
    status: 'PENDING',
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsError } = await (admin as any).from('order_items').insert(orderItemRows);
  if (itemsError) {
    // Rollback order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('orders').delete().eq('id', orderId);
    return { success: false, error: 'order_items_create_failed' };
  }

  // ── 8. Insert PENDING payment record ────────────────────────────────────
  // payment_key is a placeholder — updated to real Toss key on confirm
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: paymentError } = await (admin as any).from('payments').insert({
    order_id: orderId,
    payment_key: `PENDING-${orderNumber}`,
    method: input.paymentMethod,
    provider: 'TOSS_PAYMENTS',
    currency: input.currency,
    amount: totalAmount,
    status: 'PENDING',
  });

  if (paymentError) {
    // Rollback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('order_items').delete().eq('order_id', orderId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('orders').delete().eq('id', orderId);
    return { success: false, error: 'payment_record_create_failed' };
  }

  // ── 9. Decrement stock (optimistic with atomic guard) ────────────────────
  for (const item of mappedItems) {
    // Only decrement if current stock >= quantity (prevents negative stock)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('product_options')
      .update({ stock: item.stock - item.quantity })
      .eq('id', item.productOptionId)
      .gte('stock', item.quantity);
  }

  return { success: true, orderId, orderNumber, totalAmount, currency: input.currency };
}

// ─── cancelPendingOrderAction ──────────────────────────────────────────────

/**
 * Called when Toss redirects to failUrl or user explicitly aborts payment.
 * Updates order → CANCELLED, payment → FAILED, restores stock.
 */
export async function cancelPendingOrderAction(
  orderId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { success: false };

  const admin = createAdminClient();

  // Verify ownership + status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order } = await (admin as any)
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .eq('user_id', authData.user.id)
    .single();

  if (!order || (order as { status: string }).status !== 'PENDING_PAYMENT') {
    return { success: false };
  }

  // Update order + payment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('orders')
    .update({ status: 'CANCELLED', cancel_reason: 'payment_aborted' })
    .eq('id', orderId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('payments')
    .update({ status: 'FAILED', failed_at: new Date().toISOString() })
    .eq('order_id', orderId)
    .eq('status', 'PENDING');

  // Restore stock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orderItems } = await (admin as any)
    .from('order_items')
    .select('product_option_id, quantity')
    .eq('order_id', orderId);

  if (orderItems) {
    for (const item of orderItems as { product_option_id: string; quantity: number }[]) {
      // Read current stock then increment — best-effort for MVP
      // TODO: Replace with Supabase DB function (rpc) for atomic increment in production
      //       e.g. supabase.rpc('increment_stock', { option_id: item.product_option_id, qty: item.quantity })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: opt } = await (admin as any)
        .from('product_options')
        .select('stock')
        .eq('id', item.product_option_id)
        .single();
      if (opt) {
        const current = (opt as { stock: number }).stock;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from('product_options')
          .update({ stock: current + item.quantity })
          .eq('id', item.product_option_id);
      }
    }
  }

  return { success: true };
}
