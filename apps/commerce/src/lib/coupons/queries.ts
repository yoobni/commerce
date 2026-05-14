import { createAdminClient } from '@/lib/supabase/admin';

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

export function calcCouponDiscount(coupon: UserCoupon, subtotal: number): number {
  if (coupon.type === 'PERCENTAGE') {
    const raw = Math.floor(subtotal * (coupon.discount_value / 100));
    return coupon.max_discount_amount !== null
      ? Math.min(raw, Math.floor(coupon.max_discount_amount))
      : raw;
  }
  return Math.min(Math.floor(coupon.discount_value), subtotal);
}

export function validateCoupon(
  coupon: UserCoupon,
  subtotal: number
): { valid: boolean; reason?: 'expired' | 'min_order' } {
  if (new Date(coupon.issuance_expires_at) <= new Date()) {
    return { valid: false, reason: 'expired' };
  }
  if (coupon.min_order_amount !== null && subtotal < coupon.min_order_amount) {
    return { valid: false, reason: 'min_order' };
  }
  return { valid: true };
}

export async function getUserCoupons(userId: string): Promise<UserCoupon[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // coupons 테이블은 RLS로 클라이언트 직접 읽기 차단 → admin client로 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('coupon_issuances')
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
        max_discount_amount: c.max_discount_amount !== null ? Number(c.max_discount_amount) : null,
        min_order_amount: c.min_order_amount !== null ? Number(c.min_order_amount) : null,
        applicable_category_ids: c.applicable_category_ids as string[] | null,
        applicable_product_ids: c.applicable_product_ids as string[] | null,
        issuance_expires_at: row.expires_at as string,
      };
    });
}
