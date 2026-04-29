import { createClient } from '@/lib/supabase/server';
import type { Coupon, CouponIssuance } from '@commerce/types';

export interface CouponIssuanceWithDetails extends CouponIssuance {
  coupon: Coupon;
}

export async function getUserCoupons(userId: string): Promise<CouponIssuanceWithDetails[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('coupon_issuances') as any)
    .select('*, coupon:coupons(*)')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });

  return (data ?? []) as CouponIssuanceWithDetails[];
}
