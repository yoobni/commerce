// Pure UI labels/variants for the coupons domain. Safe for client imports.

import type { CouponIssuanceStatus, CouponStatus } from '@commerce/types';

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
