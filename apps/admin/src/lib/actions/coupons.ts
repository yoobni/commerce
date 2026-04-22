'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { CouponType, Currency } from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';
import { getSession } from '@/lib/auth/session';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export interface CouponInput {
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
  starts_at: string; // ISO datetime
  expires_at: string; // ISO datetime
}

export interface IssueCouponInput {
  couponId: string;
  userEmail: string;
  expiresAt: string; // ISO datetime
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getRequestMeta(): Promise<{ ip: string; ua: string }> {
  const h = await headers();
  const ip = h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'unknown';
  const ua = h.get('user-agent') ?? 'unknown';
  return { ip, ua };
}

async function writeAuditLog(params: {
  adminId: string;
  action: string;
  targetId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip: string;
  ua: string;
}): Promise<void> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('audit_logs') as any).insert({
    admin_id: params.adminId,
    action: params.action,
    target_type: 'coupon',
    target_id: params.targetId,
    before_value: params.before,
    after_value: params.after,
    ip_address: params.ip,
    user_agent: params.ua,
    memo: null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCoupon(
  adminId: string,
  input: CouponInput
): Promise<ActionResult> {
  const supabase = createServiceClient();
  const { ip, ua } = await getRequestMeta();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('coupons') as any)
    .insert({
      code: input.code.trim().toUpperCase(),
      name_ko: input.name_ko,
      name_en: input.name_en,
      name_ja: input.name_ja,
      name_de: input.name_de,
      type: input.type,
      discount_value: input.discount_value,
      max_discount_amount: input.max_discount_amount,
      min_order_amount: input.min_order_amount,
      currency: input.currency,
      applicable_category_ids: null,
      applicable_product_ids: null,
      max_issuance_count: input.max_issuance_count,
      max_use_per_user: input.max_use_per_user,
      is_combinable: input.is_combinable,
      status: 'ACTIVE',
      starts_at: input.starts_at,
      expires_at: input.expires_at,
      created_by: adminId,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? '쿠폰 생성에 실패했습니다.' };
  }

  const id = (data as { id: string }).id;

  await writeAuditLog({
    adminId,
    action: 'CREATE_COUPON',
    targetId: id,
    before: null,
    after: input as unknown as Record<string, unknown>,
    ip,
    ua,
  });

  revalidatePath('/coupons');
  return { ok: true, id };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCoupon(
  id: string,
  adminId: string,
  input: CouponInput
): Promise<ActionResult> {
  const supabase = createServiceClient();
  const { ip, ua } = await getRequestMeta();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: before } = await (supabase.from('coupons') as any)
    .select('*')
    .eq('id', id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('coupons') as any)
    .update({
      name_ko: input.name_ko,
      name_en: input.name_en,
      name_ja: input.name_ja,
      name_de: input.name_de,
      type: input.type,
      discount_value: input.discount_value,
      max_discount_amount: input.max_discount_amount,
      min_order_amount: input.min_order_amount,
      currency: input.currency,
      max_issuance_count: input.max_issuance_count,
      max_use_per_user: input.max_use_per_user,
      is_combinable: input.is_combinable,
      starts_at: input.starts_at,
      expires_at: input.expires_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };

  await writeAuditLog({
    adminId,
    action: 'UPDATE_COUPON',
    targetId: id,
    before: before as Record<string, unknown> | null,
    after: input as unknown as Record<string, unknown>,
    ip,
    ua,
  });

  revalidatePath('/coupons');
  revalidatePath(`/coupons/${id}`);
  revalidatePath(`/coupons/${id}/edit`);
  return { ok: true, id };
}

// ─── Pause ────────────────────────────────────────────────────────────────────

export async function pauseCoupon(id: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  const { ip, ua } = await getRequestMeta();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('coupons') as any)
    .update({ status: 'PAUSED', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;

  await writeAuditLog({
    adminId: session.id,
    action: 'PAUSE_COUPON',
    targetId: id,
    before: { status: 'ACTIVE' },
    after: { status: 'PAUSED' },
    ip,
    ua,
  });

  revalidatePath('/coupons');
  revalidatePath(`/coupons/${id}`);
}

// ─── Resume ───────────────────────────────────────────────────────────────────

export async function resumeCoupon(id: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  const { ip, ua } = await getRequestMeta();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('coupons') as any)
    .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;

  await writeAuditLog({
    adminId: session.id,
    action: 'RESUME_COUPON',
    targetId: id,
    before: { status: 'PAUSED' },
    after: { status: 'ACTIVE' },
    ip,
    ua,
  });

  revalidatePath('/coupons');
  revalidatePath(`/coupons/${id}`);
}

// ─── Issue to user ────────────────────────────────────────────────────────────

export async function issueCoupon(
  adminId: string,
  input: IssueCouponInput
): Promise<ActionResult> {
  const supabase = createServiceClient();
  const { ip, ua } = await getRequestMeta();

  // Lookup user by email
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user, error: userErr } = await (supabase.from('users') as any)
    .select('id, email')
    .eq('email', input.userEmail.trim().toLowerCase())
    .single();

  if (userErr || !user) {
    return { ok: false, error: '해당 이메일의 회원을 찾을 수 없습니다.' };
  }

  const userId = (user as { id: string; email: string }).id;

  // Fetch coupon for validation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: coupon, error: couponErr } = await (supabase.from('coupons') as any)
    .select('id, status, max_issuance_count, max_use_per_user')
    .eq('id', input.couponId)
    .single();

  if (couponErr || !coupon) {
    return { ok: false, error: '쿠폰을 찾을 수 없습니다.' };
  }

  const c = coupon as {
    id: string;
    status: string;
    max_issuance_count: number | null;
    max_use_per_user: number;
  };

  if (c.status !== 'ACTIVE') {
    return { ok: false, error: '활성 상태의 쿠폰만 발급할 수 있습니다.' };
  }

  // Check total issuance cap
  if (c.max_issuance_count !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase.from('coupon_issuances') as any)
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', input.couponId)
      .neq('status', 'REVOKED');

    if ((count ?? 0) >= c.max_issuance_count) {
      return { ok: false, error: '최대 발급 수량을 초과했습니다.' };
    }
  }

  // Check per-user cap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: userCount } = await (supabase.from('coupon_issuances') as any)
    .select('id', { count: 'exact', head: true })
    .eq('coupon_id', input.couponId)
    .eq('user_id', userId)
    .neq('status', 'REVOKED');

  if ((userCount ?? 0) >= c.max_use_per_user) {
    return { ok: false, error: '해당 회원의 발급 한도를 초과했습니다.' };
  }

  // Insert issuance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: issuance, error: issueErr } = await (supabase.from('coupon_issuances') as any)
    .insert({
      coupon_id: input.couponId,
      user_id: userId,
      status: 'ISSUED',
      issued_at: new Date().toISOString(),
      expires_at: input.expiresAt,
    })
    .select('id')
    .single();

  if (issueErr || !issuance) {
    return { ok: false, error: issueErr?.message ?? '쿠폰 발급에 실패했습니다.' };
  }

  const issuanceId = (issuance as { id: string }).id;

  await writeAuditLog({
    adminId,
    action: 'ISSUE_COUPON',
    targetId: input.couponId,
    before: null,
    after: {
      user_id: userId,
      user_email: input.userEmail,
      issuance_id: issuanceId,
      expires_at: input.expiresAt,
    },
    ip,
    ua,
  });

  revalidatePath(`/coupons/${input.couponId}`);
  return { ok: true, id: issuanceId };
}
