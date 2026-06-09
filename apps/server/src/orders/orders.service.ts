import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order, OrderWithItems, PaginatedResponse } from '@commerce/types';
import { SUPABASE_ADMIN } from '../supabase/supabase.module';
import { safeImageSrc } from '../common/safe-image-src';

export interface CreateOrderShipping {
  addressId: string | null;
  recipientName: string;
  phone: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string | null;
  deliveryMemo?: string | null;
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
  couponIssuanceId?: string | null;
  pointUsed?: number;
  currency: 'KRW' | 'USD' | 'JPY' | 'EUR';
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

function sanitizeOrder(o: OrderWithItems): OrderWithItems {
  return {
    ...o,
    items: o.items?.map((item) => ({
      ...item,
      product_snapshot: item.product_snapshot
        ? {
            ...item.product_snapshot,
            thumbnail_url: safeImageSrc(item.product_snapshot.thumbnail_url),
          }
        : item.product_snapshot,
    })),
  } as OrderWithItems;
}

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${date}-${suffix}`;
}

@Injectable()
export class OrdersService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async listForUser(
    userId: string,
    { page = 1, perPage = 10 }: { page?: number; perPage?: number } = {}
  ): Promise<PaginatedResponse<Order>> {
    const offset = (page - 1) * perPage;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, count, error } = await (this.supabase.from('orders') as any)
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('ordered_at', { ascending: false })
      .range(offset, offset + perPage - 1);
    if (error) throw error;
    const total = count ?? 0;
    return {
      data: (data ?? []) as Order[],
      total,
      page,
      per_page: perPage,
      has_next: offset + perPage < total,
    };
  }

  async getForUser(orderId: string, userId: string): Promise<OrderWithItems | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('orders') as any)
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return sanitizeOrder(data as OrderWithItems);
  }

  async cancel(orderId: string, userId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('orders') as any)
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  /**
   * Create an order with line items. Splits across orders / order_items / addresses
   * tables; on order_items failure we compensate by deleting the orphaned order
   * (no real DB transaction available through PostgREST).
   */
  async create(
    userId: string,
    input: CreateOrderInput
  ): Promise<{ orderId: string; orderNumber: string }> {
    // 1. Resolve address — create one if the caller didn't pass an existing id.
    let addressId = input.shipping.addressId;
    if (!addressId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newAddr, error: addrError } = await (this.supabase.from('addresses') as any)
        .insert({
          user_id: userId,
          recipient_name: input.shipping.recipientName,
          phone: input.shipping.phone,
          country: 'KR',
          postal_code: input.shipping.postalCode,
          city: '',
          address_line1: input.shipping.addressLine1,
          address_line2: input.shipping.addressLine2 ?? null,
          is_default: false,
        })
        .select('id')
        .single();
      if (addrError || !newAddr) {
        throw new Error(addrError?.message ?? 'address_create_failed');
      }
      addressId = (newAddr as { id: string }).id;
    }

    const shippingSnapshot = {
      recipient_name: input.shipping.recipientName,
      phone: input.shipping.phone,
      postal_code: input.shipping.postalCode,
      address_line1: input.shipping.addressLine1,
      address_line2: input.shipping.addressLine2 ?? null,
      memo: input.shipping.deliveryMemo ?? null,
    };

    const orderNumber = generateOrderNumber();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: orderData, error: orderError } = await (this.supabase.from('orders') as any)
      .insert({
        order_number: orderNumber,
        user_id: userId,
        address_id: addressId,
        shipping_address_snapshot: shippingSnapshot,
        currency: input.currency,
        subtotal: input.subtotal,
        shipping_fee: input.shippingFee,
        discount_amount: input.discountAmount,
        tax_amount: input.taxAmount,
        total_amount: input.totalAmount,
        coupon_issuance_id: input.couponIssuanceId ?? null,
        point_used: input.pointUsed ?? 0,
        status: 'PENDING_PAYMENT',
        memo: input.shipping.deliveryMemo ?? null,
      })
      .select('id')
      .single();
    if (orderError || !orderData) {
      throw new Error(orderError?.message ?? 'order_create_failed');
    }
    const orderId = (orderData as { id: string }).id;

    const itemRows = input.items.map((item) => ({
      order_id: orderId,
      product_option_id: item.productOptionId,
      product_snapshot: item.snapshot,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      status: 'PENDING',
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: itemsError } = await (this.supabase.from('order_items') as any).insert(itemRows);
    if (itemsError) {
      // Compensating delete — leave no orphaned orders behind.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.supabase.from('orders') as any).delete().eq('id', orderId);
      throw new Error(itemsError.message);
    }

    // Inventory deduction hook still lives in the seed/migration layer
    // (decrement_stock RPC pending). Once available, call it here.

    return { orderId, orderNumber };
  }
}
