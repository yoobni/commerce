import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaginatedResponse,
  Payment,
  User,
} from '@commerce/types';

export interface OrderRow {
  id: string;
  order_number: string;
  user: Pick<User, 'id' | 'name' | 'email'> | null;
  currency: string;
  total_amount: number;
  status: OrderStatus;
  ordered_at: string;
}

export interface OrderDetail extends Order {
  user: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null;
  items: OrderItem[];
  payment: Payment | null;
}

export interface ListParams {
  status?: OrderStatus | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

// Server-side state machine — kept here (and not on the client) so the
// transition contract is enforced regardless of caller.
const ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING_PAYMENT: ['CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['CONFIRMED', 'RETURN_REQUESTED'],
  CONFIRMED: [],
  RETURN_REQUESTED: ['RETURNED', 'PREPARING'],
  RETURNED: ['REFUND_REQUESTED'],
  REFUND_REQUESTED: ['REFUNDED'],
  REFUNDED: [],
  CANCELLED: [],
  DELIVERY_FAILED: ['RETURN_REQUESTED', 'CANCELLED'],
};

@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async list(params: ListParams = {}): Promise<PaginatedResponse<OrderRow>> {
    const { status = 'ALL', search, page = 1, per_page = 20 } = params;
    const offset = (page - 1) * per_page;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.supabase.from('orders') as any).select(
      'id, order_number, currency, total_amount, status, ordered_at, user:users!user_id(id, name, email)',
      { count: 'exact' }
    );
    if (status !== 'ALL') query = query.eq('status', status);
    if (search) {
      const safe = search.replace(/[%_]/g, (m) => `\\${m}`);
      query = query.or(`order_number.ilike.%${safe}%`);
    }
    query = query.order('ordered_at', { ascending: false }).range(offset, offset + per_page - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count ?? 0;
    return {
      data: (data ?? []) as OrderRow[],
      total,
      page,
      per_page,
      has_next: offset + per_page < total,
    };
  }

  async getById(id: string): Promise<OrderDetail | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('orders') as any)
      .select(
        `*,
        user:users!user_id(id, name, email, phone),
        items:order_items(*),
        payment:payments!order_id(*)`
      )
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return data as OrderDetail;
  }

  async updateStatus(id: string, newStatus: OrderStatus): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current, error: fetchError } = await (this.supabase.from('orders') as any)
      .select('status')
      .eq('id', id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!current) throw new NotFoundException('order_not_found');

    const allowed = ORDER_TRANSITIONS[(current as { status: OrderStatus }).status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException('invalid_status_transition');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('orders') as any)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      this.logger.error(`[updateStatus] ${error.message}`);
      throw new BadRequestException('status_update_failed');
    }
  }

  async updateMemo(id: string, memo: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('orders') as any)
      .update({ admin_memo: memo.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      this.logger.error(`[updateMemo] ${error.message}`);
      throw new BadRequestException('memo_update_failed');
    }
  }

  /**
   * Process a refund. Sequence:
   *   1. Fetch order + payment, validate state.
   *   2. Call Toss PG cancel (skipped when key absent — dev mode).
   *   3. Update payment row (status + refund_amount).
   *   4. On full refund: restore points, restore coupon, restore stock.
   *   5. Update order status to REFUNDED.
   *
   * `adminId` is recorded as the actor on point_transactions.
   */
  async refund(orderId: string, refundAmount: number, adminId: string): Promise<void> {
    // 1. Fetch order + payment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order } = await (this.supabase.from('orders') as any)
      .select('id, status, user_id, coupon_issuance_id, point_used')
      .eq('id', orderId)
      .maybeSingle();
    if (!order) throw new NotFoundException('order_not_found');
    if ((order as { status: string }).status !== 'REFUND_REQUESTED') {
      throw new BadRequestException('order_not_in_refund_requested');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: payment } = await (this.supabase.from('payments') as any)
      .select('id, payment_key, amount, refund_amount, status, provider')
      .eq('order_id', orderId)
      .maybeSingle();
    if (!payment) throw new BadRequestException('payment_not_found');
    if (!['PAID', 'PARTIALLY_REFUNDED'].includes((payment as { status: string }).status)) {
      throw new BadRequestException('payment_not_refundable');
    }

    const alreadyRefunded: number = (payment as { refund_amount: number | null }).refund_amount ?? 0;
    const amount = (payment as { amount: number }).amount;
    const paymentKey = (payment as { payment_key: string }).payment_key;
    const paymentId = (payment as { id: string }).id;
    const maxRefundable = amount - alreadyRefunded;
    if (refundAmount <= 0 || refundAmount > maxRefundable) {
      throw new BadRequestException('invalid_refund_amount');
    }

    // 2. PG cancel (Toss). Skipped if env var absent (dev mode).
    const tossKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
    if (tossKey) {
      const res = await fetch(
        `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${tossKey}:`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cancelReason: '관리자 환불', cancelAmount: refundAmount }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        this.logger.error(
          `[refund/pg] toss cancel failed: ${(body as { message?: string }).message ?? res.statusText}`
        );
        throw new BadRequestException('pg_cancel_failed');
      }
    }

    const newRefundAmount = alreadyRefunded + refundAmount;
    const isFullRefund = newRefundAmount >= amount;
    const newPaymentStatus = isFullRefund ? 'FULLY_REFUNDED' : 'PARTIALLY_REFUNDED';

    // 3. Update payment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: pmtErr } = await (this.supabase.from('payments') as any)
      .update({
        status: newPaymentStatus,
        refund_amount: newRefundAmount,
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);
    if (pmtErr) {
      this.logger.error(`[refund/payment] ${pmtErr.message}`);
      throw new BadRequestException('refund_payment_update_failed');
    }

    if (isFullRefund) {
      const userId = (order as { user_id: string | null }).user_id;
      const pointUsed = (order as { point_used: number }).point_used ?? 0;
      const couponIssuanceId = (order as { coupon_issuance_id: string | null })
        .coupon_issuance_id;

      // 4a. Restore points
      if (pointUsed > 0 && userId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: pts } = await (this.supabase.from('points') as any)
          .select('balance')
          .eq('user_id', userId)
          .maybeSingle();
        const currentBalance: number = (pts as { balance: number } | null)?.balance ?? 0;
        const newBalance = currentBalance + pointUsed;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.supabase.from('points') as any).upsert({
          user_id: userId,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.supabase.from('point_transactions') as any).insert({
          user_id: userId,
          type: 'CANCEL_USE',
          amount: pointUsed,
          balance_after: newBalance,
          reason: `주문 환불 (${orderId})`,
          reference_type: 'ORDER',
          reference_id: orderId,
          created_by: adminId,
        });
      }

      // 4b. Restore coupon
      if (couponIssuanceId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.supabase.from('coupon_issuances') as any)
          .update({ status: 'ISSUED', used_at: null, used_order_id: null })
          .eq('id', couponIssuanceId);
      }

      // 4c. Restore stock
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: items } = await (this.supabase.from('order_items') as any)
        .select('product_option_id, quantity')
        .eq('order_id', orderId);
      if (items) {
        for (const item of items as { product_option_id: string; quantity: number }[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (this.supabase.rpc as any)('increment_stock', {
            p_option_id: item.product_option_id,
            p_qty: item.quantity,
          })
            .then(() => null)
            .catch(() => null);
        }
      }
    }

    // 5. Mark order REFUNDED
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: ordErr } = await (this.supabase.from('orders') as any)
      .update({ status: 'REFUNDED', updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (ordErr) {
      this.logger.error(`[refund/order] ${ordErr.message}`);
      throw new BadRequestException('refund_order_update_failed');
    }
  }
}
