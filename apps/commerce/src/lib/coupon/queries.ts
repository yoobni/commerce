import { createClient } from '@/lib/supabase/server';
import type { Coupon, CouponIssuance, Locale } from '@commerce/types';

export interface CouponIssuanceWithCoupon extends CouponIssuance {
  coupon: Coupon;
}

export async function getUserCouponIssuances(): Promise<CouponIssuanceWithCoupon[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('coupon_issuances')
    .select('*, coupons(*)')
    .eq('user_id', user.id)
    .eq('status', 'ISSUED')
    .gt('expires_at', new Date().toISOString())
    .order('issued_at', { ascending: false });

  if (!data) return [];

  return (data as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    coupon_id: row.coupon_id as string,
    user_id: row.user_id as string,
    status: row.status as CouponIssuance['status'],
    used_at: (row.used_at as string | null) ?? null,
    used_order_id: (row.used_order_id as string | null) ?? null,
    issued_at: row.issued_at as string,
    expires_at: row.expires_at as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coupon: (row.coupons as any) as Coupon,
  }));
}

export interface CouponValidationResult {
  valid: boolean;
  issuanceId?: string;
  discountAmount?: number;
  error?: 'not_found' | 'not_issued' | 'expired' | 'below_min_order' | 'already_used';
  couponName?: string;
}

export async function validateCouponCode(
  code: string,
  subtotal: number,
  locale: Locale
): Promise<CouponValidationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { valid: false, error: 'not_found' };

  // Find coupon by code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: couponData } = await (supabase as any)
    .from('coupons')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .single();

  if (!couponData) return { valid: false, error: 'not_found' };
  const coupon = couponData as Coupon;

  // Check coupon status / validity
  const now = new Date();
  if (coupon.status !== 'ACTIVE' || new Date(coupon.expires_at) < now) {
    return { valid: false, error: 'expired' };
  }

  // Check if issued to this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: issuanceData } = await (supabase as any)
    .from('coupon_issuances')
    .select('id, status, expires_at')
    .eq('coupon_id', coupon.id)
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false })
    .limit(1)
    .single();

  if (!issuanceData) return { valid: false, error: 'not_issued' };

  const issuance = issuanceData as { id: string; status: string; expires_at: string };
  if (issuance.status === 'USED') return { valid: false, error: 'already_used' };
  if (issuance.status !== 'ISSUED' || new Date(issuance.expires_at) < now) {
    return { valid: false, error: 'expired' };
  }

  // Validate min_order_amount
  if (coupon.min_order_amount && subtotal < Number(coupon.min_order_amount)) {
    return { valid: false, error: 'below_min_order' };
  }

  // Compute discount
  let discount = 0;
  if (coupon.type === 'FIXED_AMOUNT') {
    discount = Number(coupon.discount_value);
  } else {
    discount = Math.floor(subtotal * (Number(coupon.discount_value) / 100));
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, Number(coupon.max_discount_amount));
    }
  }

  const nameKey = `name_${locale}` as keyof Coupon;
  const couponName = (coupon[nameKey] as string | undefined) ?? coupon.name_ko;

  return {
    valid: true,
    issuanceId: issuance.id,
    discountAmount: discount,
    couponName,
  };
}
