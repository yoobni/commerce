'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateOrderNumber } from '@commerce/shared';
import type { Currency, Locale } from '@commerce/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShippingForm {
  recipient_name: string;
  phone: string;
  postal_code: string;
  address_line1: string;
  address_line2: string | null;
}

export interface CreateOrderInput {
  cartId: string;
  selectedAddressId: string | null;
  shippingForm: ShippingForm;
  deliveryNote: string | null;
  paymentMethod: string;
  couponIssuanceId: string | null;
  couponDiscount: number;
  pointsToUse: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  currency: Currency;
  locale: Locale;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

const LOCALE_COUNTRY: Record<Locale, string> = {
  ko: 'KR',
  en: 'US',
  ja: 'JP',
  de: 'DE',
};

const PAY_METHOD_MAP: Record<string, string> = {
  card: 'CARD',
  kakao: 'KAKAO_PAY',
  naver: 'NAVER_PAY',
  toss: 'TOSS_PAY',
  transfer: 'CARD',
};

// ─── Create Order ─────────────────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  const admin = createAdminClient();
  const currKey = input.currency.toLowerCase() as 'krw' | 'usd' | 'jpy' | 'eur';

  // 1. Fetch cart items with product details
  const { data: rawItems } = await (admin.from('cart_items') as any)
    .select(
      `
      id, quantity, product_option_id,
      product_options!inner (
        id, color, sku,
        additional_price_krw, additional_price_usd, additional_price_jpy, additional_price_eur,
        stock,
        sizes ( label ),
        products!inner (
          id, name_ko, thumbnail_url,
          base_price_krw, base_price_usd, base_price_jpy, base_price_eur
        )
      )
    `
    )
    .eq('cart_id', input.cartId);

  if (!rawItems || (rawItems as any[]).length === 0) {
    return { success: false, error: 'cart_empty' };
  }

  // 2. Validate stock
  for (const item of rawItems as any[]) {
    const opt = item.product_options as any;
    if (opt.stock < item.quantity) {
      return { success: false, error: 'stock_insufficient' };
    }
  }

  // 3. Validate points
  if (input.pointsToUse > 0) {
    if (input.pointsToUse < 1000) return { success: false, error: 'points_min_1000' };
    const { data: pts } = await (admin.from('points') as any)
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    const balance = ((pts as any)?.balance ?? 0) as number;
    if (input.pointsToUse > balance) return { success: false, error: 'points_insufficient' };
  }

  // 4. Resolve address_id — use existing or create a temporary one
  let addressId: string;
  if (input.selectedAddressId) {
    addressId = input.selectedAddressId;
  } else {
    const { data: newAddr, error: addrErr } = await (admin.from('addresses') as any)
      .insert({
        user_id: user.id,
        recipient_name: input.shippingForm.recipient_name,
        phone: input.shippingForm.phone,
        country: LOCALE_COUNTRY[input.locale],
        postal_code: input.shippingForm.postal_code,
        city: '',
        address_line1: input.shippingForm.address_line1,
        address_line2: input.shippingForm.address_line2 ?? null,
        is_default: false,
        label: null,
      })
      .select('id')
      .single();
    if (addrErr || !newAddr) return { success: false, error: 'address_create_failed' };
    addressId = (newAddr as { id: string }).id;
  }

  // 5. Build shipping snapshot
  const shippingSnapshot = {
    recipient_name: input.shippingForm.recipient_name,
    phone: input.shippingForm.phone,
    postal_code: input.shippingForm.postal_code,
    address_line1: input.shippingForm.address_line1,
    address_line2: input.shippingForm.address_line2 ?? null,
    country: LOCALE_COUNTRY[input.locale],
    city: '',
  };

  // 6. Create order
  const orderNumber = generateOrderNumber();
  const { data: newOrder, error: orderError } = await (admin.from('orders') as any)
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      address_id: addressId,
      shipping_address_snapshot: shippingSnapshot,
      currency: input.currency,
      subtotal: input.subtotal,
      shipping_fee: input.shippingFee,
      discount_amount: input.couponDiscount + input.pointsToUse,
      tax_amount: 0,
      total_amount: input.totalAmount,
      coupon_issuance_id: input.couponIssuanceId ?? null,
      point_used: input.pointsToUse,
      status: 'PENDING_PAYMENT',
      memo: input.deliveryNote ?? null,
      ordered_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (orderError || !newOrder) {
    return { success: false, error: (orderError as any)?.message ?? 'order_create_failed' };
  }
  const orderId = (newOrder as { id: string }).id;

  // 7. Create order items
  const orderItems = (rawItems as any[]).map((item) => {
    const opt = item.product_options as any;
    const prod = opt.products as any;
    const unitPrice =
      (prod[`base_price_${currKey}`] as number) + (opt[`additional_price_${currKey}`] as number);
    return {
      order_id: orderId,
      product_option_id: item.product_option_id,
      product_snapshot: {
        product_id: prod.id,
        product_option_id: opt.id,
        name: prod.name_ko,
        sku: opt.sku,
        thumbnail_url: prod.thumbnail_url,
        size: (opt.sizes as any)?.label ?? '',
        color: opt.color,
      },
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: unitPrice * (item.quantity as number),
      status: 'PENDING',
    };
  });

  const { error: itemsError } = await (admin.from('order_items') as any).insert(orderItems);
  if (itemsError) {
    await (admin.from('orders') as any).delete().eq('id', orderId);
    return { success: false, error: (itemsError as any).message };
  }

  // 8. Create payment record
  const { error: pmtError } = await (admin.from('payments') as any).insert({
    order_id: orderId,
    payment_key: `mock-${crypto.randomUUID()}`,
    method: PAY_METHOD_MAP[input.paymentMethod] ?? 'CARD',
    provider: 'TOSS_PAYMENTS',
    currency: input.currency,
    amount: input.totalAmount,
    status: 'PENDING',
    pg_response: {},
  });

  if (pmtError) {
    await (admin.from('order_items') as any).delete().eq('order_id', orderId);
    await (admin.from('orders') as any).delete().eq('id', orderId);
    return { success: false, error: (pmtError as any).message };
  }

  // 9. Deduct stock
  for (const item of rawItems as any[]) {
    const opt = item.product_options as any;
    await (admin.from('product_options') as any)
      .update({ stock: (opt.stock as number) - (item.quantity as number) })
      .eq('id', item.product_option_id);
  }

  // 10. Mark coupon as USED
  if (input.couponIssuanceId) {
    await (admin.from('coupon_issuances') as any)
      .update({
        status: 'USED',
        used_at: new Date().toISOString(),
        used_order_id: orderId,
      })
      .eq('id', input.couponIssuanceId);
  }

  // 11. Deduct points
  if (input.pointsToUse > 0) {
    const { data: pts } = await (admin.from('points') as any)
      .select('id, balance, total_used')
      .eq('user_id', user.id)
      .maybeSingle();
    if (pts) {
      const p = pts as { id: string; balance: number; total_used: number };
      const newBalance = p.balance - input.pointsToUse;
      await (admin.from('points') as any)
        .update({
          balance: newBalance,
          total_used: p.total_used + input.pointsToUse,
          updated_at: new Date().toISOString(),
        })
        .eq('id', p.id);
      await (admin.from('point_transactions') as any).insert({
        user_id: user.id,
        type: 'USE',
        amount: input.pointsToUse,
        balance_after: newBalance,
        reason: `주문 포인트 사용 (${orderNumber})`,
        reference_type: 'ORDER',
        reference_id: orderId,
      });
    }
  }

  // 12. Clear cart
  await (admin.from('cart_items') as any).delete().eq('cart_id', input.cartId);

  revalidatePath('/account/orders');
  return { success: true, orderId, orderNumber };
}

// ─── Cancel Order ─────────────────────────────────────────────────────────────

export async function cancelOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  const admin = createAdminClient();

  const { data: order } = await (admin.from('orders') as any)
    .select('id, status, user_id, coupon_issuance_id, point_used')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!order) return { success: false, error: 'order_not_found' };
  const o = order as {
    id: string;
    status: string;
    user_id: string;
    coupon_issuance_id: string | null;
    point_used: number;
  };
  if (!['PENDING_PAYMENT', 'PAID'].includes(o.status)) {
    return { success: false, error: 'not_cancellable' };
  }

  const now = new Date().toISOString();

  // Update order
  await (admin.from('orders') as any)
    .update({ status: 'CANCELLED', cancel_reason: '사용자 취소', updated_at: now })
    .eq('id', orderId);

  // Update payment
  await (admin.from('payments') as any)
    .update({ status: 'CANCELLED', cancelled_at: now, updated_at: now })
    .eq('order_id', orderId);

  // Restore stock
  const { data: items } = await (admin.from('order_items') as any)
    .select('product_option_id, quantity')
    .eq('order_id', orderId);

  if (items) {
    for (const item of items as { product_option_id: string; quantity: number }[]) {
      const { data: opt } = await (admin.from('product_options') as any)
        .select('stock')
        .eq('id', item.product_option_id)
        .single();
      if (opt) {
        await (admin.from('product_options') as any)
          .update({ stock: ((opt as { stock: number }).stock ?? 0) + item.quantity })
          .eq('id', item.product_option_id);
      }
    }
  }

  // Restore coupon
  if (o.coupon_issuance_id) {
    await (admin.from('coupon_issuances') as any)
      .update({ status: 'ISSUED', used_at: null, used_order_id: null })
      .eq('id', o.coupon_issuance_id);
  }

  // Restore points
  if (o.point_used > 0) {
    const { data: pts } = await (admin.from('points') as any)
      .select('id, balance, total_used')
      .eq('user_id', user.id)
      .maybeSingle();
    if (pts) {
      const p = pts as { id: string; balance: number; total_used: number };
      const newBalance = p.balance + o.point_used;
      await (admin.from('points') as any)
        .update({
          balance: newBalance,
          total_used: Math.max(0, p.total_used - o.point_used),
          updated_at: now,
        })
        .eq('id', p.id);
      await (admin.from('point_transactions') as any).insert({
        user_id: user.id,
        type: 'CANCEL_USE',
        amount: o.point_used,
        balance_after: newBalance,
        reason: `주문 취소 포인트 복원 (${orderId})`,
        reference_type: 'ORDER',
        reference_id: orderId,
      });
    }
  }

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath('/account/orders');
  return { success: true };
}
