'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCartWithItems } from '@/lib/cart/queries';
import { generateOrderNumber } from '@commerce/shared';
import type { Currency, Country, Locale } from '@commerce/types';

type PayMethod = 'card' | 'kakao' | 'naver' | 'toss' | 'transfer';

const LOCALE_CURRENCY: Record<Locale, Currency> = {
  ko: 'KRW',
  en: 'USD',
  ja: 'JPY',
  de: 'EUR',
};

const LOCALE_COUNTRY: Record<Locale, Country> = {
  ko: 'KR',
  en: 'US',
  ja: 'JP',
  de: 'DE',
};

const FREE_SHIPPING_THRESHOLD: Record<Locale, number> = {
  ko: 50000,
  en: 50,
  ja: 7000,
  de: 50,
};

const SHIPPING_FEE_BY_LOCALE: Record<Locale, number> = {
  ko: 3000,
  en: 10,
  ja: 1000,
  de: 8,
};

const PAY_METHOD_MAP: Record<PayMethod, string> = {
  card: 'CARD',
  kakao: 'KAKAO_PAY',
  naver: 'NAVER_PAY',
  toss: 'TOSS_PAY',
  transfer: 'CARD',
};

export interface CreateOrderInput {
  recipient: string;
  phone: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  deliveryNote: string;
  payMethod: PayMethod;
  couponIssuanceId: string | null;
  pointUsed: number;
  locale: Locale;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
}

export async function createOrderAction(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const cart = await getCartWithItems();
  if (!cart || cart.items.length === 0) throw new Error('장바구니가 비어있습니다.');

  // Validate stock
  for (const item of cart.items) {
    if (item.stock < item.quantity) {
      throw new Error(`재고 부족: ${item.product_name_ko}`);
    }
  }

  // Compute totals on server side
  const locale = input.locale;
  const currency = LOCALE_CURRENCY[locale];
  const country = LOCALE_COUNTRY[locale];

  const getUnitPrice = (item: (typeof cart.items)[number]): number => {
    const base =
      locale === 'ko'
        ? item.product_base_price_krw
        : locale === 'ja'
          ? item.product_base_price_jpy
          : locale === 'de'
            ? item.product_base_price_eur
            : item.product_base_price_usd;
    const extra =
      locale === 'ko'
        ? item.additional_price_krw
        : locale === 'ja'
          ? item.additional_price_jpy
          : locale === 'de'
            ? item.additional_price_eur
            : item.additional_price_usd;
    return base + extra;
  };

  const subtotal = cart.items.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0);
  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD[locale] ? 0 : SHIPPING_FEE_BY_LOCALE[locale];

  // Validate and compute coupon discount
  let couponDiscount = 0;
  if (input.couponIssuanceId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: issuance } = await (supabase.from('coupon_issuances') as any)
      .select('*, coupon:coupons(*)')
      .eq('id', input.couponIssuanceId)
      .eq('user_id', user.id)
      .single();

    if (!issuance || issuance.status !== 'ISSUED') throw new Error('유효하지 않은 쿠폰입니다.');
    if (issuance.coupon.status !== 'ACTIVE') throw new Error('사용 불가한 쿠폰입니다.');
    if (new Date(issuance.expires_at) < new Date()) throw new Error('만료된 쿠폰입니다.');

    const coupon = issuance.coupon;
    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      throw new Error(`최소 주문 금액 ${coupon.min_order_amount} 이상 필요합니다.`);
    }

    if (coupon.type === 'PERCENTAGE') {
      couponDiscount = Math.floor(subtotal * (coupon.discount_value / 100));
      if (coupon.max_discount_amount) {
        couponDiscount = Math.min(couponDiscount, coupon.max_discount_amount as number);
      }
    } else {
      couponDiscount = coupon.discount_value as number;
    }
  }

  // Validate points
  const rawPointUsed = Math.max(0, Math.floor(input.pointUsed));
  let pointUsed = 0;
  if (rawPointUsed > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pts } = await (supabase.from('points') as any)
      .select('balance')
      .eq('user_id', user.id)
      .single();
    const balance: number = pts?.balance ?? 0;
    if (balance < rawPointUsed) throw new Error('포인트 잔액이 부족합니다.');
    pointUsed = rawPointUsed;
  }

  const discountAmount = couponDiscount + pointUsed;
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);
  const now = new Date().toISOString();
  const orderNumber = generateOrderNumber();

  // Decrement stock
  for (const item of cart.items) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('product_options') as any)
      .update({ stock: item.stock - item.quantity, updated_at: now })
      .eq('id', item.product_option_id);
  }

  const shippingAddressSnapshot = {
    id: crypto.randomUUID(),
    user_id: user.id,
    label: null,
    recipient_name: input.recipient,
    phone: input.phone,
    country,
    postal_code: input.postalCode,
    state_province: null,
    city: '',
    address_line1: input.addressLine1,
    address_line2: input.addressLine2 || null,
    is_default: false,
    created_at: now,
  };

  // Create order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderErr } = await (supabase.from('orders') as any)
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      address_id: null,
      shipping_address_snapshot: shippingAddressSnapshot,
      currency,
      subtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      tax_amount: 0,
      total_amount: totalAmount,
      coupon_issuance_id: input.couponIssuanceId || null,
      point_used: pointUsed,
      status: 'PAID',
      memo: input.deliveryNote || null,
      admin_memo: null,
      cancel_reason: null,
      return_reason: null,
      ordered_at: now,
    })
    .select('id, order_number')
    .single();

  if (orderErr || !order) throw new Error('주문 생성 실패');

  // Create order items
  const orderItemsPayload = cart.items.map((item) => {
    const unitPrice = getUnitPrice(item);
    return {
      order_id: (order as { id: string }).id,
      product_option_id: item.product_option_id,
      product_snapshot: {
        product_id: item.product_id,
        product_option_id: item.product_option_id,
        name: item.product_name_ko,
        sku: item.sku,
        thumbnail_url: item.product_thumbnail_url,
        size: item.size_label ?? '',
        color: item.color,
      },
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: unitPrice * item.quantity,
      status: 'PENDING',
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('order_items') as any).insert(orderItemsPayload);

  // Create mock payment (no real PG)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('payments') as any).insert({
    order_id: (order as { id: string }).id,
    payment_key: `mock_${Date.now()}`,
    method: PAY_METHOD_MAP[input.payMethod],
    provider: 'TOSS_PAYMENTS',
    currency,
    amount: totalAmount,
    status: 'PAID',
    paid_at: now,
    failed_at: null,
    cancelled_at: null,
    refund_amount: null,
    refunded_at: null,
    pg_response: { mock: true },
  });

  // Mark coupon used
  if (input.couponIssuanceId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('coupon_issuances') as any)
      .update({
        status: 'USED',
        used_at: now,
        used_order_id: (order as { id: string }).id,
      })
      .eq('id', input.couponIssuanceId);
  }

  // Deduct points
  if (pointUsed > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pts } = await (supabase.from('points') as any)
      .select('balance, total_earned, total_used, total_expired')
      .eq('user_id', user.id)
      .single();
    const newBalance = (pts?.balance ?? 0) - pointUsed;
    const newTotalUsed = (pts?.total_used ?? 0) + pointUsed;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('points') as any).upsert({
      user_id: user.id,
      balance: newBalance,
      total_earned: pts?.total_earned ?? 0,
      total_used: newTotalUsed,
      total_expired: pts?.total_expired ?? 0,
      updated_at: now,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('point_transactions') as any).insert({
      user_id: user.id,
      type: 'USE',
      amount: pointUsed,
      balance_after: newBalance,
      reason: `주문 결제 (${orderNumber})`,
      reference_type: 'ORDER',
      reference_id: (order as { id: string }).id,
    });
  }

  // Clear cart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('cart_items') as any).delete().eq('cart_id', cart.id);

  revalidatePath('/account/orders');

  return {
    orderId: (order as { id: string; order_number: string }).id,
    orderNumber: (order as { id: string; order_number: string }).order_number,
  };
}

export async function cancelOrderAction(orderId: string, reason?: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order } = await (supabase.from('orders') as any)
    .select('id, user_id, status, coupon_issuance_id, point_used')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!order) throw new Error('주문을 찾을 수 없습니다.');
  if (!['PENDING_PAYMENT', 'PAID'].includes((order as { status: string }).status)) {
    throw new Error('취소할 수 없는 주문 상태입니다.');
  }

  const now = new Date().toISOString();

  // Restore stock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase.from('order_items') as any)
    .select('product_option_id, quantity')
    .eq('order_id', orderId);

  if (items) {
    for (const item of items as { product_option_id: string; quantity: number }[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: opt } = await (supabase.from('product_options') as any)
        .select('stock')
        .eq('id', item.product_option_id)
        .single();
      if (opt) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('product_options') as any)
          .update({ stock: (opt as { stock: number }).stock + item.quantity, updated_at: now })
          .eq('id', item.product_option_id);
      }
    }
  }

  // Restore coupon
  const typedOrder = order as {
    coupon_issuance_id: string | null;
    point_used: number;
  };

  if (typedOrder.coupon_issuance_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('coupon_issuances') as any)
      .update({ status: 'ISSUED', used_at: null, used_order_id: null })
      .eq('id', typedOrder.coupon_issuance_id);
  }

  // Restore points
  if (typedOrder.point_used > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pts } = await (supabase.from('points') as any)
      .select('balance, total_earned, total_used, total_expired')
      .eq('user_id', user.id)
      .single();
    const newBalance = (pts?.balance ?? 0) + typedOrder.point_used;
    const newTotalUsed = Math.max(0, (pts?.total_used ?? 0) - typedOrder.point_used);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('points') as any).upsert({
      user_id: user.id,
      balance: newBalance,
      total_earned: pts?.total_earned ?? 0,
      total_used: newTotalUsed,
      total_expired: pts?.total_expired ?? 0,
      updated_at: now,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('point_transactions') as any).insert({
      user_id: user.id,
      type: 'CANCEL_USE',
      amount: typedOrder.point_used,
      balance_after: newBalance,
      reason: `주문 취소 환원 (${orderId})`,
      reference_type: 'ORDER',
      reference_id: orderId,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('orders') as any)
    .update({ status: 'CANCELLED', cancel_reason: reason || null, updated_at: now })
    .eq('id', orderId);

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath('/account/orders');
}
