/**
 * Admin coupon queries. Re-exports lib/api/coupons + UI labels/variants.
 */

import type {
  CouponIssuanceStatus,
  CouponStatus,
  PaginatedResponse,
  Coupon,
} from '@commerce/types';
import {
  adminListCoupons as apiListCoupons,
  adminGetCoupon as apiGetCoupon,
  adminListCouponIssuances as apiListIssuances,
  type CouponRow as ApiCouponRow,
  type IssuanceRow as ApiIssuanceRow,
  type AdminCouponListParams,
  type AdminIssuanceListParams,
} from '@/lib/api/coupons';

// ─── UI labels & Badge variants (어드민 페이지 공용) ────────────────────────

export const COUPON_STATUS_LABEL: Record<CouponStatus, string> = {
  ACTIVE: '활성',
  PAUSED: '일시정지',
  EXPIRED: '만료',
  DEPLETED: '소진',
};

export const COUPON_STATUS_VARIANT: Record<
  CouponStatus,
  'success' | 'warning' | 'muted' | 'destructive'
> = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  EXPIRED: 'muted',
  DEPLETED: 'destructive',
};

export const COUPON_ISSUANCE_STATUS_LABEL: Record<CouponIssuanceStatus, string> = {
  ISSUED: '발급됨',
  USED: '사용됨',
  EXPIRED: '만료',
  REVOKED: '취소됨',
};

export const COUPON_ISSUANCE_STATUS_VARIANT: Record<
  CouponIssuanceStatus,
  'info' | 'success' | 'muted' | 'destructive'
> = {
  ISSUED: 'info',
  USED: 'success',
  EXPIRED: 'muted',
  REVOKED: 'destructive',
};

// ─── Re-exported types ──────────────────────────────────────────────────────

export type CouponRow = ApiCouponRow;
export type IssuanceRow = ApiIssuanceRow;
export type { AdminCouponListParams, AdminIssuanceListParams };

// ─── Re-exported queries ────────────────────────────────────────────────────

export async function adminListCoupons(
  params: AdminCouponListParams = {}
): Promise<PaginatedResponse<CouponRow>> {
  return apiListCoupons(params);
}

export async function adminGetCoupon(couponId: string): Promise<Coupon | null> {
  return apiGetCoupon(couponId);
}

export async function adminListCouponIssuances(
  couponId: string,
  params: AdminIssuanceListParams = {}
): Promise<PaginatedResponse<IssuanceRow>> {
  return apiListIssuances(couponId, params);
}
