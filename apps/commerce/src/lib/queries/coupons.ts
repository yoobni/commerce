import type { CouponIssuance, Coupon, PaginatedResponse } from '@commerce/types';
import { createClient } from '../supabase/server';

export interface CouponIssuanceWithCoupon extends CouponIssuance {
  coupon: Coupon;
}

export async function getUserCoupons(
  userId: string,
  { page = 1, per_page = 50 }: { page?: number; per_page?: number } = {}
): Promise<PaginatedResponse<CouponIssuanceWithCoupon>> {
  const supabase = await createClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (supabase.from('coupon_issuances') as any)
    .select(`*, coupon:coupons(*)`, { count: 'exact' })
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as CouponIssuanceWithCoupon[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}
