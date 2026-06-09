'use client';

// Client-side order mutations.

import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import { apiPost } from './client';

async function browserToken(): Promise<string | undefined> {
  const supabase = createBrowserSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export interface CreateOrderShipping {
  addressId: string | null;
  recipientName: string;
  phone: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
  deliveryMemo?: string;
}

export interface CreateOrderItem {
  productOptionId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  snapshot: {
    product_id: string;
    product_option_id: string;
    name: string;
    sku: string;
    thumbnail_url: string;
    size: string;
    color: string;
  };
}

export interface CreateOrderInput {
  cartId: string;
  shipping: CreateOrderShipping;
  items: CreateOrderItem[];
  couponIssuanceId?: string;
  pointUsed?: number;
  currency: 'KRW' | 'USD' | 'JPY' | 'EUR';
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  return apiPost('/orders', {
    accessToken: await browserToken(),
    body: {
      cart_id: input.cartId,
      shipping: {
        address_id: input.shipping.addressId,
        recipient_name: input.shipping.recipientName,
        phone: input.shipping.phone,
        postal_code: input.shipping.postalCode,
        address_line1: input.shipping.addressLine1,
        address_line2: input.shipping.addressLine2,
        delivery_memo: input.shipping.deliveryMemo,
      },
      items: input.items.map((i) => ({
        product_option_id: i.productOptionId,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        total_price: i.totalPrice,
        snapshot: i.snapshot,
      })),
      coupon_issuance_id: input.couponIssuanceId,
      point_used: input.pointUsed,
      currency: input.currency,
      subtotal: input.subtotal,
      shipping_fee: input.shippingFee,
      discount_amount: input.discountAmount,
      tax_amount: input.taxAmount,
      total_amount: input.totalAmount,
    },
  });
}

export async function cancelOrder(orderId: string): Promise<void> {
  await apiPost(`/orders/${encodeURIComponent(orderId)}/cancel`, {
    accessToken: await browserToken(),
  });
}
