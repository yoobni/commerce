/**
 * Admin coupon queries — uses service-role client (bypasses RLS).
 */

import type {
  Coupon,
  CouponIssuance,
  CouponStatus,
  PaginatedResponse,
  UUID,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Extended types ───────────────────────────────────────────────────────────

export interface CouponIssuanceWithUser extends CouponIssuance {
  user: {
    id: UUID;
    name: string;
    email: string;
  } | null;
}

export interface CouponStats {
  total_issued: number;
  total_used: number;
  total_expired: number;
  total_revoked: number;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export interface AdminCouponListParams {
  status?: CouponStatus | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

export async function adminListCoupons(
  params: AdminCouponListParams = {}
): Promise<PaginatedResponse<Coupon>> {
  const { status = 'ALL', search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('coupons') as any).select('*', { count: 'exact' });

  if (status !== 'ALL') query = query.eq('status', status);
  if (search) {
    query = query.or(
      `code.ilike.%${search}%,name_ko.ilike.%${search}%,name_en.ilike.%${search}%`
    );
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as Coupon[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function adminGetCoupon(id: string): Promise<Coupon | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('coupons') as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Coupon;
}

// ─── Issuances ────────────────────────────────────────────────────────────────

export interface AdminIssuanceListParams {
  couponId: string;
  page?: number;
  per_page?: number;
}

export async function adminGetCouponIssuances(
  params: AdminIssuanceListParams
): Promise<PaginatedResponse<CouponIssuanceWithUser>> {
  const { couponId, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (supabase.from('coupon_issuances') as any)
    .select('*, user:users(id, name, email)', { count: 'exact' })
    .eq('coupon_id', couponId)
    .order('issued_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as CouponIssuanceWithUser[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function adminGetCouponStats(couponId: string): Promise<CouponStats> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('coupon_issuances') as any)
    .select('status')
    .eq('coupon_id', couponId);

  if (error) throw error;

  const rows = (data ?? []) as { status: string }[];
  return {
    total_issued: rows.length,
    total_used: rows.filter((r) => r.status === 'USED').length,
    total_expired: rows.filter((r) => r.status === 'EXPIRED').length,
    total_revoked: rows.filter((r) => r.status === 'REVOKED').length,
  };
}
