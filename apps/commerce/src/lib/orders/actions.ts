'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function cancelOrderAction(orderId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
}

// ─── createOrderAction ────────────────────────────────────────────────────────

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
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${date}-${suffix}`;
}

// Inventory deduction placeholder — awaits decrement_stock RPC (separate task)
// PROPOSE_TASK:재고 차감 훅 구현|order_items 인서트 후 product_options.stock 감소 — decrement_stock RPC 작성 및 _deductInventoryHook 연결 필요|주문 생성 시 재고 차감 미처리 상태
async function _deductInventoryHook(_items: CreateOrderItem[]): Promise<void> {
  // TODO: supabase.rpc('decrement_stock', { p_option_id, p_qty }) per item
}

export async function createOrderAction(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  // Auth: user-facing action — verify via cookie session first
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'unauthorized' };

  // orders/order_items have no user INSERT RLS — use service_role
  const admin = createAdminClient();

  // 1. Resolve address_id — create if not yet saved
  let addressId = input.shipping.addressId;
  if (!addressId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newAddr, error: addrError } = await (supabase.from('addresses') as any)
      .insert({
        user_id: user.id,
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
      return { success: false, error: addrError?.message ?? 'address_create_failed' };
    }
    addressId = (newAddr as { id: string }).id;
  }

  // 2. Snapshot: immutable record of shipping info at order time
  const shippingSnapshot = {
    recipient_name: input.shipping.recipientName,
    phone: input.shipping.phone,
    postal_code: input.shipping.postalCode,
    address_line1: input.shipping.addressLine1,
    address_line2: input.shipping.addressLine2 ?? null,
    memo: input.shipping.deliveryMemo ?? null,
  };

  // 3. Insert order — DB trigger auto-inserts order_status_history on creation
  const orderNumber = generateOrderNumber();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orderData, error: orderError } = await (admin.from('orders') as any)
    .insert({
      order_number: orderNumber,
      user_id: user.id,
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
    return { success: false, error: orderError?.message ?? 'order_create_failed' };
  }

  const orderId = (orderData as { id: string }).id;

  // 4. Insert order_items — compensating delete on failure (no DB transaction in JS client)
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
  const { error: itemsError } = await (admin.from('order_items') as any).insert(itemRows);

  if (itemsError) {
    // Compensating rollback: delete the orphaned order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('orders') as any).delete().eq('id', orderId);
    return { success: false, error: itemsError.message };
  }

  // 5. Inventory deduction hook (no-op until RPC is implemented)
  await _deductInventoryHook(input.items);

  // Payment gateway is called in a separate step — this action intentionally stops here
  return { success: true, orderId, orderNumber };
}
