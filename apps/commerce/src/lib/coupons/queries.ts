import { createClient } from '@/lib/supabase/server';
import { calculateCouponDiscount } from '@commerce/shared';
import type { Coupon, CouponIssuance } from '@commerce/types';

export interface ValidatedCoupon {
  issuanceId: string;
  couponId: string;
  discountAmount: number;
  name: string;
}

export async function validateCouponByCode(
  code: string,
  userId: string,
  orderSubtotal: number
): Promise<{ valid: boolean; coupon?: ValidatedCoupon; error?: string }> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: coupon } = await (supabase.from('coupons') as any)
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('status', 'ACTIVE')
    .lte('starts_at', now)
    .gte('expires_at', now)
    .maybeSingle();

  if (!coupon) return { valid: false, error: 'invalid_code' };

  const c = coupon as Coupon;

  if (c.min_order_amount && orderSubtotal < c.min_order_amount) {
    return { valid: false, error: 'min_order_amount' };
  }

  const { data: issuance } = await (supabase.from('coupon_issuances') as any)
    .select('id, expires_at')
    .eq('coupon_id', c.id)
    .eq('user_id', userId)
    .eq('status', 'ISSUED')
    .gte('expires_at', now)
    .maybeSingle();

  if (!issuance) return { valid: false, error: 'no_issuance' };

  const iss = issuance as Pick<CouponIssuance, 'id' | 'expires_at'>;
  const discountAmount = Math.floor(
    calculateCouponDiscount(orderSubtotal, c.type, c.discount_value, c.max_discount_amount)
  );

  return {
    valid: true,
    coupon: {
      issuanceId: iss.id,
      couponId: c.id,
      discountAmount,
      name: c.name_ko,
    },
  };
}

export interface UserCouponItem {
  issuanceId: string;
  couponId: string;
  code: string;
  name: string;
  discountText: string;
  expiresAt: string;
  minOrderAmount: number | null;
}

export async function getUserIssuedCoupons(userId: string): Promise<UserCouponItem[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data } = await (supabase.from('coupon_issuances') as any)
    .select(
      `
      id,
      expires_at,
      coupons!inner (
        id, code, name_ko, type, discount_value, max_discount_amount, min_order_amount
      )
    `
    )
    .eq('user_id', userId)
    .eq('status', 'ISSUED')
    .gte('expires_at', now)
    .order('expires_at', { ascending: true });

  if (!data) return [];

  return (data as any[]).map((row) => {
    const c = row.coupons as any;
    const discountText =
      c.type === 'PERCENTAGE'
        ? `${c.discount_value}% 할인`
        : `${(c.discount_value as number).toLocaleString()}원 할인`;
    return {
      issuanceId: row.id as string,
      couponId: c.id as string,
      code: c.code as string,
      name: c.name_ko as string,
      discountText,
      expiresAt: row.expires_at as string,
      minOrderAmount: (c.min_order_amount as number | null) ?? null,
    };
  });
}
