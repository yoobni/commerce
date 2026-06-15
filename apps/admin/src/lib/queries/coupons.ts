/**
 * Admin coupon queries. Re-exports lib/api/coupons + UI labels/variants.
 */

import type { PaginatedResponse, Coupon } from '@commerce/types';
import {
  adminListCoupons as apiListCoupons,
  adminGetCoupon as apiGetCoupon,
  adminListCouponIssuances as apiListIssuances,
  type CouponRow as ApiCouponRow,
  type IssuanceRow as ApiIssuanceRow,
  type AdminCouponListParams,
  type AdminIssuanceListParams,
} from '@/lib/api/coupons';

// UI labels live in lib/admin-ui/coupons-labels.ts (safe for client imports).
export {
  COUPON_STATUS_LABEL,
  COUPON_STATUS_VARIANT,
  COUPON_ISSUANCE_STATUS_LABEL,
  COUPON_ISSUANCE_STATUS_VARIANT,
} from '@/lib/admin-ui/coupons-labels';

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
