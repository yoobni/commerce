'use server';

import { createClient } from '@/lib/supabase/server';
import type { Address, Currency, ProductSnapshot } from '@commerce/types';
import type { CartItemDisplay } from '@/lib/cart/queries';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateOrderInput {
  addressId: string;
  couponIssuanceId: string | null;
  pointUsed: number;
  items: CartItemDisplay[];
  locale: string;
}

export type CreateOrderResult =
  | {
      success: true;
      orderId: string;
      orderNumber: string;
      amount: number;
      currency: Currency;
      orderName: string;
    }
  | {
      success: false;
      error:
        | 'not_authenticated'
        | 'cart_empty'
        | 'address_not_found'
        | 'insufficient_stock'
        | 'coupon_invalid'
        | 'points_invalid'
        | 'order_failed';
      detail?: string;
    };

// ─── Constants ────────────────────────────────────────────────────────────────

type LocalePriceKey =
  | 'product_base_price_krw'
  | 'product_base_price_usd'
  | 'product_base_price_jpy'
  | 'product_base_price_eur';
type LocaleAdditionalKey =
  | 'additional_price_krw'
  | 'additional_price_usd'
  | 'additional_price_jpy'
  | 'additional_price_eur';

const LOCALE_PRICE: Record<
  string,
  { base: LocalePriceKey; additional: LocaleAdditionalKey; currency: Currency }
> = {
  ko: { base: 'product_base_price_krw', additional: 'additional_price_krw', currency: 'KRW' },
  en: { base: 'product_base_price_usd', additional: 'additional_price_usd', currency: 'USD' },
  ja: { base: 'product_base_price_jpy', additional: 'additional_price_jpy', currency: 'JPY' },
  de: { base: 'product_base_price_eur', additional: 'additional_price_eur', currency: 'EUR' },
};

const SHIPPING_THRESHOLDS: Record<Currency, { freeThreshold: number; fee: number }> = {
  KRW: { freeThreshold: 50000, fee: 3000 },
  USD: { freeThreshold: 50, fee: 5 },
  JPY: { freeThreshold: 5000, fee: 500 },
  EUR: { freeThreshold: 50, fee: 5 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ORD-${date}-${rand}`;
}

// ─── createOrderAction ────────────────────────────────────────────────────────

export async function createOrderAction(input: CreateOrderInput): Promise<CreateOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };
  if (!input.items.length) return { success: false, error: 'cart_empty' };

  const priceMap = LOCALE_PRICE[input.locale] ?? LOCALE_PRICE.ko;

  // 1. Fetch address
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: addressData } = await (supabase as any)
    .from('addresses')
    .select('*')
    .eq('id', input.addressId)
    .eq('user_id', user.id)
    .single();
  if (!addressData) return { success: false, error: 'address_not_found' };
  const address = addressData as Address;

  // 2. Compute amounts
  const subtotal = input.items.reduce(
    (sum, item) => sum + (item[priceMap.base] + item[priceMap.additional]) * item.quantity,
    0
  );
  const { freeThreshold, fee: shippingFeeBase } = SHIPPING_THRESHOLDS[priceMap.currency];
  const shippingFee = subtotal >= freeThreshold ? 0 : shippingFeeBase;

  // 3. Validate + compute coupon discount
  let couponDiscountAmount = 0;
  if (input.couponIssuanceId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: issuanceData } = await (supabase as any)
      .from('coupon_issuances')
      .select('*, coupons(*)')
      .eq('id', input.couponIssuanceId)
      .eq('user_id', user.id)
      .eq('status', 'ISSUED')
      .single();

    if (!issuanceData) return { success: false, error: 'coupon_invalid', detail: 'not_issued' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coupon = (issuanceData as any).coupons;
    if (!coupon || coupon.status !== 'ACTIVE')
      return { success: false, error: 'coupon_invalid', detail: 'inactive' };

    const now = new Date();
    if (new Date(coupon.expires_at) < now || new Date(issuanceData.expires_at) < now)
      return { success: false, error: 'coupon_invalid', detail: 'expired' };

    if (coupon.min_order_amount && subtotal < Number(coupon.min_order_amount))
      return { success: false, error: 'coupon_invalid', detail: 'below_min_order' };

    if (coupon.type === 'FIXED_AMOUNT') {
      couponDiscountAmount = Number(coupon.discount_value);
    } else {
      couponDiscountAmount = Math.floor(subtotal * (Number(coupon.discount_value) / 100));
      if (coupon.max_discount_amount) {
        couponDiscountAmount = Math.min(couponDiscountAmount, Number(coupon.max_discount_amount));
      }
    }
  }

  // 4. Validate points (KRW only, min 1000)
  if (input.pointUsed > 0) {
    if (priceMap.currency !== 'KRW')
      return { success: false, error: 'points_invalid', detail: 'krw_only' };
    if (input.pointUsed < 1000)
      return { success: false, error: 'points_invalid', detail: 'min_1000' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ptData } = await (supabase as any)
      .from('points')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    const balance = ptData ? Number((ptData as { balance: number }).balance) : 0;
    if (input.pointUsed > balance)
      return { success: false, error: 'points_invalid', detail: 'exceeds_balance' };
  }

  const discountAmount = couponDiscountAmount + input.pointUsed;
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  // 5. Check stock for all items (pre-flight)
  for (const item of input.items) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: optData } = await (supabase as any)
      .from('product_options')
      .select('stock')
      .eq('id', item.product_option_id)
      .single();
    if (!optData || (optData as { stock: number }).stock < item.quantity) {
      return { success: false, error: 'insufficient_stock', detail: item.product_option_id };
    }
  }

  // 6. Create order
  const orderNumber = generateOrderNumber();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orderData, error: orderError } = await (supabase as any)
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      address_id: input.addressId,
      shipping_address_snapshot: address,
      currency: priceMap.currency,
      subtotal: subtotal.toFixed(2),
      shipping_fee: shippingFee.toFixed(2),
      discount_amount: discountAmount.toFixed(2),
      tax_amount: '0.00',
      total_amount: totalAmount.toFixed(2),
      coupon_issuance_id: input.couponIssuanceId ?? null,
      point_used: input.pointUsed,
      status: 'PENDING_PAYMENT',
    })
    .select('id, order_number')
    .single();

  if (orderError || !orderData)
    return {
      success: false,
      error: 'order_failed',
      detail: (orderError as { message?: string } | null)?.message,
    };

  const { id: orderId, order_number: createdOrderNumber } = orderData as {
    id: string;
    order_number: string;
  };

  // 7. Create order_items with product snapshot
  const orderItemsPayload = input.items.map((item) => {
    const unitPrice = item[priceMap.base] + item[priceMap.additional];
    const localeName = `product_name_${input.locale}` as keyof CartItemDisplay;
    const snapshot: ProductSnapshot = {
      product_id: item.product_id,
      product_option_id: item.product_option_id,
      name: (item[localeName] as string | undefined) ?? item.product_name_ko,
      sku: item.sku,
      thumbnail_url: item.product_thumbnail_url,
      size: item.size_label ?? '',
      color: item.color,
    };
    return {
      order_id: orderId,
      product_option_id: item.product_option_id,
      product_snapshot: snapshot,
      quantity: item.quantity,
      unit_price: unitPrice.toFixed(2),
      total_price: (unitPrice * item.quantity).toFixed(2),
      status: 'PENDING',
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsError } = await (supabase as any).from('order_items').insert(orderItemsPayload);
  if (itemsError)
    return {
      success: false,
      error: 'order_failed',
      detail: (itemsError as { message?: string }).message,
    };

  // 8. Atomically deduct stock via RPC
  for (const item of input.items) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: stockErr } = await (supabase as any).rpc('decrement_stock', {
      p_option_id: item.product_option_id,
      p_quantity: item.quantity,
    });
    if (stockErr) {
      // Deduction failed — cancel the order we just created
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('orders')
        .update({ status: 'CANCELLED' })
        .eq('id', orderId);
      return { success: false, error: 'insufficient_stock', detail: item.product_option_id };
    }
  }

  // 9. Mark coupon as USED
  if (input.couponIssuanceId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('coupon_issuances').update({
      status: 'USED',
      used_at: new Date().toISOString(),
      used_order_id: orderId,
    }).eq('id', input.couponIssuanceId);
  }

  // 10. Deduct points
  if (input.pointUsed > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pt } = await (supabase as any)
      .from('points')
      .select('balance, total_used')
      .eq('user_id', user.id)
      .single();
    if (pt) {
      const row = pt as { balance: number; total_used: number };
      const newBalance = row.balance - input.pointUsed;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('points')
        .update({ balance: newBalance, total_used: row.total_used + input.pointUsed })
        .eq('user_id', user.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('point_transactions').insert({
        user_id: user.id,
        type: 'USE',
        amount: input.pointUsed,
        balance_after: newBalance,
        reason: `주문 포인트 사용 (${createdOrderNumber})`,
        reference_type: 'ORDER',
        reference_id: orderId,
      });
    }
  }

  // 11. Build orderName for TossPayments
  const first = input.items[0];
  const firstNameKey = `product_name_${input.locale}` as keyof CartItemDisplay;
  const firstName = (first[firstNameKey] as string | undefined) ?? first.product_name_ko;
  const orderName =
    input.items.length === 1 ? firstName : `${firstName} 외 ${input.items.length - 1}건`;

  return {
    success: true,
    orderId,
    orderNumber: createdOrderNumber,
    amount: Math.round(totalAmount),
    currency: priceMap.currency,
    orderName,
  };
}

// ─── cancelPendingOrderAction ─────────────────────────────────────────────────

export async function cancelPendingOrderAction(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order } = await (supabase as any)
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('status', 'PENDING_PAYMENT')
    .single();

  if (!order) return { success: false, error: 'order_not_found' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderRow = order as any;
  const items = orderRow.order_items as Array<{ product_option_id: string; quantity: number }>;

  // Restore stock
  for (const item of items) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc('increment_stock', {
      p_option_id: item.product_option_id,
      p_quantity: item.quantity,
    });
  }

  // Restore coupon
  if (orderRow.coupon_issuance_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('coupon_issuances')
      .update({ status: 'ISSUED', used_at: null, used_order_id: null })
      .eq('id', orderRow.coupon_issuance_id);
  }

  // Restore points
  if (orderRow.point_used > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pt } = await (supabase as any)
      .from('points')
      .select('balance, total_used')
      .eq('user_id', user.id)
      .single();
    if (pt) {
      const row = pt as { balance: number; total_used: number };
      const restored = row.balance + orderRow.point_used;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('points')
        .update({ balance: restored, total_used: Math.max(0, row.total_used - orderRow.point_used) })
        .eq('user_id', user.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('point_transactions').insert({
        user_id: user.id,
        type: 'CANCEL_USE',
        amount: orderRow.point_used,
        balance_after: restored,
        reason: `주문 취소 포인트 환원 (${orderRow.order_number})`,
        reference_type: 'ORDER',
        reference_id: orderId,
      });
    }
  }

  // Cancel order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('orders')
    .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) return { success: false, error: (error as { message?: string }).message };
  return { success: true };
}
