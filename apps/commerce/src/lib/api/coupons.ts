import { apiGetOne, apiPost } from './client';
import { getAccessToken } from './auth';

// Coupon validation helpers stay client-pure — they don't hit the network.
// Just call calc/validate locally once you've fetched UserCoupon[] via the API.

export interface UserCoupon {
  issuance_id: string;
  coupon_id: string;
  code: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE';
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  applicable_category_ids: string[] | null;
  applicable_product_ids: string[] | null;
  issuance_expires_at: string;
}

export function calcCouponDiscount(coupon: UserCoupon, subtotal: number): number {
  if (coupon.type === 'PERCENTAGE') {
    const raw = Math.floor(subtotal * (coupon.discount_value / 100));
    return coupon.max_discount_amount !== null
      ? Math.min(raw, Math.floor(coupon.max_discount_amount))
      : raw;
  }
  return Math.min(Math.floor(coupon.discount_value), subtotal);
}

export function validateCoupon(
  coupon: UserCoupon,
  subtotal: number
): { valid: boolean; reason?: 'expired' | 'min_order' } {
  if (new Date(coupon.issuance_expires_at) <= new Date()) {
    return { valid: false, reason: 'expired' };
  }
  if (coupon.min_order_amount !== null && subtotal < coupon.min_order_amount) {
    return { valid: false, reason: 'min_order' };
  }
  return { valid: true };
}

/** Server-side: returns the authenticated viewer's usable coupons. */
export async function getUserCoupons(): Promise<UserCoupon[]> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) return [];
  return apiGetOne<UserCoupon[]>('/coupons/me', { accessToken, noStore: true });
}

/** Server-side: mark a coupon issuance as USED (usually after order payment). */
export async function markCouponIssuanceUsed(
  issuanceId: string,
  orderId?: string
): Promise<void> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) throw new Error('unauthorized');
  await apiPost<{ issuance_id: string }>(
    `/coupons/issuances/${encodeURIComponent(issuanceId)}/use`,
    {
      accessToken,
      body: orderId ? { order_id: orderId } : {},
    }
  );
}
