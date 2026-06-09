import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../supabase/supabase.module';

// `coupons` is RLS-locked (client direct reads denied). NestJS is the BFF —
// scope every query to the caller user_id, return only ISSUED+ACTIVE issuances
// within the validity window.

export interface UserCoupon {
  issuance_id: string;
  coupon_id: string;
  code: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE';
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  applicable_category_ids: string[] | null;
  applicable_product_ids: string[] | null;
  issuance_expires_at: string;
}

@Injectable()
export class CouponsService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async listForUser(userId: string): Promise<UserCoupon[]> {
    const now = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('coupon_issuances') as any)
      .select(
        `
        id,
        coupon_id,
        expires_at,
        coupons!inner (
          code,
          type,
          discount_value,
          max_discount_amount,
          min_order_amount,
          applicable_category_ids,
          applicable_product_ids,
          status,
          starts_at,
          expires_at
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'ISSUED')
      .gt('expires_at', now);

    if (!data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[])
      .filter((row) => {
        const c = row.coupons;
        return (
          c &&
          c.status === 'ACTIVE' &&
          new Date(c.starts_at) <= new Date() &&
          new Date(c.expires_at) > new Date()
        );
      })
      .map((row) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = row.coupons as any;
        return {
          issuance_id: row.id as string,
          coupon_id: row.coupon_id as string,
          code: c.code as string,
          type: c.type as 'FIXED_AMOUNT' | 'PERCENTAGE',
          discount_value: Number(c.discount_value),
          max_discount_amount:
            c.max_discount_amount !== null ? Number(c.max_discount_amount) : null,
          min_order_amount: c.min_order_amount !== null ? Number(c.min_order_amount) : null,
          applicable_category_ids: c.applicable_category_ids as string[] | null,
          applicable_product_ids: c.applicable_product_ids as string[] | null,
          issuance_expires_at: row.expires_at as string,
        };
      });
  }

  /**
   * Mark a coupon issuance as USED after a successful order. The compound WHERE
   * (status='ISSUED') is the idempotency guard — re-firing for the same issuance
   * is a no-op.
   */
  async markUsed(issuanceId: string, orderId?: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('coupon_issuances') as any)
      .update({
        status: 'USED',
        used_at: new Date().toISOString(),
        ...(orderId ? { used_order_id: orderId } : {}),
      })
      .eq('id', issuanceId)
      .eq('status', 'ISSUED');
    if (error) throw error;
  }
}
