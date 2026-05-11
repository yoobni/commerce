'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { requireRole } from '@/lib/auth/guard';
import type { CouponType, CouponStatus, Currency } from '@commerce/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SaveCouponInput {
  code: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  name_de: string;
  type: CouponType;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  currency: Currency | null;
  max_issuance_count: number | null;
  max_use_per_user: number;
  is_combinable: boolean;
  starts_at: string;
  expires_at: string;
}

// ─── Save coupon (create or update) ──────────────────────────────────────────

export async function saveCoupon(couponId: string | null, input: SaveCouponInput): Promise<string> {
  const session = await requireRole('OPERATOR');

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  if (!couponId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('coupons') as any)
      .insert({
        ...input,
        status: 'ACTIVE' as CouponStatus,
        created_by: session.id,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single();

    if (error) throw new Error(`쿠폰 생성 실패: ${error.message}`);
    revalidatePath('/coupons');
    return data.id as string;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('coupons') as any)
      .update({ ...input, updated_at: now })
      .eq('id', couponId);

    if (error) throw new Error(`쿠폰 수정 실패: ${error.message}`);
    revalidatePath('/coupons');
    revalidatePath(`/coupons/${couponId}`);
    return couponId;
  }
}

// ─── Update coupon status ─────────────────────────────────────────────────────

export async function updateCouponStatus(couponId: string, status: CouponStatus): Promise<void> {
  await requireRole('OPERATOR');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('coupons') as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', couponId);

  if (error) throw new Error(`상태 변경 실패: ${error.message}`);
  revalidatePath('/coupons');
  revalidatePath(`/coupons/${couponId}`);
}

// ─── Issue coupon to user by email ────────────────────────────────────────────

export async function issueCouponToUserByEmail(couponId: string, email: string): Promise<void> {
  await requireRole('OPERATOR');

  const supabase = createServiceClient();

  // Find user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userRow, error: userErr } = await (supabase.from('users') as any)
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .single();

  if (userErr || !userRow) throw new Error('해당 이메일의 사용자를 찾을 수 없습니다.');

  const userId = userRow.id as string;

  // Get coupon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: coupon, error: couponErr } = await (supabase.from('coupons') as any)
    .select('status, max_issuance_count, max_use_per_user, expires_at')
    .eq('id', couponId)
    .single();

  if (couponErr || !coupon) throw new Error('쿠폰을 찾을 수 없습니다.');
  if (coupon.status !== 'ACTIVE') throw new Error('활성 상태 쿠폰만 발급할 수 있습니다.');

  // Check max_issuance_count
  if (coupon.max_issuance_count !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase.from('coupon_issuances') as any)
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', couponId);
    if ((count ?? 0) >= coupon.max_issuance_count) {
      throw new Error('발급 한도를 초과하였습니다.');
    }
  }

  // Check max_use_per_user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: userCount } = await (supabase.from('coupon_issuances') as any)
    .select('*', { count: 'exact', head: true })
    .eq('coupon_id', couponId)
    .eq('user_id', userId)
    .neq('status', 'REVOKED');

  if ((userCount ?? 0) >= coupon.max_use_per_user) {
    throw new Error('해당 사용자의 발급 한도를 초과하였습니다.');
  }

  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('coupon_issuances') as any).insert({
    coupon_id: couponId,
    user_id: userId,
    status: 'ISSUED',
    used_at: null,
    used_order_id: null,
    issued_at: now,
    expires_at: coupon.expires_at,
  });

  if (error) throw new Error(`발급 실패: ${error.message}`);
  revalidatePath(`/coupons/${couponId}`);
}

// ─── Revoke issuance ──────────────────────────────────────────────────────────

export async function revokeCouponIssuance(issuanceId: string, couponId: string): Promise<void> {
  await requireRole('OPERATOR');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('coupon_issuances') as any)
    .update({ status: 'REVOKED', updated_at: new Date().toISOString() })
    .eq('id', issuanceId)
    .eq('status', 'ISSUED'); // only revoke ISSUED (not USED)

  if (error) throw new Error(`취소 실패: ${error.message}`);
  revalidatePath(`/coupons/${couponId}`);
}
