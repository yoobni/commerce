'use server';

import { revalidatePath } from 'next/cache';
import {
  adminSaveCoupon,
  adminUpdateCouponStatus,
  adminIssueCouponByEmail,
  adminRevokeIssuance,
  type SaveCouponInput,
} from '@/lib/api/coupons';
import { ApiCallError } from '@/lib/api/client';
import type { CouponStatus } from '@commerce/types';

export type { SaveCouponInput };

function mapError(e: unknown, fallback: string): Error {
  if (e instanceof ApiCallError) {
    const map: Record<string, string> = {
      coupon_create_failed: '쿠폰 생성 실패',
      coupon_update_failed: '쿠폰 수정 실패',
      status_update_failed: '쿠폰 상태 변경 실패',
      coupon_not_found: '쿠폰을 찾을 수 없습니다.',
      coupon_not_active: '활성 상태 쿠폰만 발급할 수 있습니다.',
      user_not_found: '해당 이메일의 사용자를 찾을 수 없습니다.',
      issuance_cap_reached: '발급 한도를 초과하였습니다.',
      user_cap_reached: '해당 사용자의 발급 한도를 초과하였습니다.',
      issuance_failed: '발급 실패',
      revoke_failed: '취소 실패',
      unauthorized: '권한이 없습니다.',
      forbidden: '권한이 없습니다.',
    };
    return new Error(map[e.code] ?? fallback);
  }
  return e instanceof Error ? e : new Error(fallback);
}

export async function saveCoupon(
  couponId: string | null,
  input: SaveCouponInput
): Promise<string> {
  let id: string;
  try {
    id = await adminSaveCoupon(couponId, input);
  } catch (e) {
    throw mapError(e, '쿠폰 저장 실패');
  }
  revalidatePath('/coupons');
  if (couponId) revalidatePath(`/coupons/${couponId}`);
  return id;
}

export async function updateCouponStatus(
  couponId: string,
  status: CouponStatus
): Promise<void> {
  try {
    await adminUpdateCouponStatus(couponId, status);
  } catch (e) {
    throw mapError(e, '쿠폰 상태 변경 실패');
  }
  revalidatePath('/coupons');
  revalidatePath(`/coupons/${couponId}`);
}

export async function issueCouponToUserByEmail(
  couponId: string,
  email: string
): Promise<void> {
  try {
    await adminIssueCouponByEmail(couponId, email);
  } catch (e) {
    throw mapError(e, '발급 실패');
  }
  revalidatePath(`/coupons/${couponId}`);
}

export async function revokeCouponIssuance(
  issuanceId: string,
  couponId: string
): Promise<void> {
  try {
    await adminRevokeIssuance(couponId, issuanceId);
  } catch (e) {
    throw mapError(e, '취소 실패');
  }
  revalidatePath(`/coupons/${couponId}`);
}
