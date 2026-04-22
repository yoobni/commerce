/**
 * Admin coupon queries — uses service-role client (bypasses RLS).
 */

import type {
  Coupon,
  CouponIssuance,
  CouponStatus,
  User,
  PaginatedResponse,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Extended types ───────────────────────────────────────────────────────────

export interface CouponRow extends Coupon {
  issuance_count: number;
  used_count: number;
}

export interface IssuanceRow extends CouponIssuance {
  user: Pick<User, 'id' | 'name' | 'email'> | null;
}

// ─── Params ───────────────────────────────────────────────────────────────────

export interface AdminCouponListParams {
  status?: CouponStatus | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface AdminIssuanceListParams {
  page?: number;
  per_page?: number;
}

// ─── Coupon list ──────────────────────────────────────────────────────────────

export async function adminListCoupons(
  params: AdminCouponListParams = {}
): Promise<PaginatedResponse<CouponRow>> {
  const { status = 'ALL', search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('coupons') as any).select('*', { count: 'exact' });

  if (status !== 'ALL') query = query.eq('status', status);
  if (search) query = query.or(`code.ilike.%${search}%,name_ko.ilike.%${search}%`);

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const coupons = (data ?? []) as Coupon[];
  const total = count ?? 0;

  // Fetch issuance counts in parallel
  const rows: CouponRow[] = await Promise.all(
    coupons.map(async (coupon) => {
      const [{ count: issued }, { count: used }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from('coupon_issuances') as any)
          .select('*', { count: 'exact', head: true })
          .eq('coupon_id', coupon.id),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from('coupon_issuances') as any)
          .select('*', { count: 'exact', head: true })
          .eq('coupon_id', coupon.id)
          .eq('status', 'USED'),
      ]);
      return { ...coupon, issuance_count: issued ?? 0, used_count: used ?? 0 };
    })
  );

  return {
    data: rows,
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

// ─── Coupon detail ────────────────────────────────────────────────────────────

export async function adminGetCoupon(couponId: string): Promise<Coupon | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('coupons') as any)
    .select('*')
    .eq('id', couponId)
    .single();

  if (error || !data) return null;
  return data as Coupon;
}

// ─── Coupon issuances ─────────────────────────────────────────────────────────

export async function adminListCouponIssuances(
  couponId: string,
  params: AdminIssuanceListParams = {}
): Promise<PaginatedResponse<IssuanceRow>> {
  const { page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (supabase.from('coupon_issuances') as any)
    .select('*, user:users!user_id(id, name, email)', { count: 'exact' })
    .eq('coupon_id', couponId)
    .order('issued_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  if (error) throw error;

  return {
    data: (data ?? []) as IssuanceRow[],
    total: count ?? 0,
    page,
    per_page,
    has_next: offset + per_page < (count ?? 0),
  };
}
