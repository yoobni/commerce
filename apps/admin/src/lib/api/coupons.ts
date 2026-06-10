// Admin coupons API client. Server-side only.

import type {
  Coupon,
  CouponIssuance,
  CouponStatus,
  CouponType,
  Currency,
  PaginatedResponse,
  User,
} from '@commerce/types';
import { apiGetList, apiGetOne, apiPatch, apiPost } from './client';
import { getAdminToken } from './auth';

export interface CouponRow extends Coupon {
  issuance_count: number;
  used_count: number;
}

export interface IssuanceRow extends CouponIssuance {
  user: Pick<User, 'id' | 'name' | 'email'> | null;
}

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

function buildCouponsQuery(params: AdminCouponListParams): string {
  const sp = new URLSearchParams();
  if (params.status && params.status !== 'ALL') sp.set('status', params.status);
  if (params.search) sp.set('search', params.search);
  if (params.page) sp.set('page', String(params.page));
  if (params.per_page) sp.set('per_page', String(params.per_page));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

function buildIssuancesQuery(params: AdminIssuanceListParams): string {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.per_page) sp.set('per_page', String(params.per_page));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

async function authed() {
  const accessToken = await getAdminToken();
  return { accessToken, noStore: true } as const;
}

export async function adminListCoupons(
  params: AdminCouponListParams = {}
): Promise<PaginatedResponse<CouponRow>> {
  const { data, meta } = await apiGetList<CouponRow>(
    `/admin/coupons${buildCouponsQuery(params)}`,
    await authed()
  );
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function adminGetCoupon(id: string): Promise<Coupon | null> {
  try {
    return await apiGetOne<Coupon>(`/admin/coupons/${id}`, await authed());
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function adminSaveCoupon(
  couponId: string | null,
  input: SaveCouponInput
): Promise<string> {
  const opts = { ...(await authed()), body: input };
  if (couponId) {
    const res = await apiPatch<{ id: string }>(`/admin/coupons/${couponId}`, opts);
    return res.id;
  }
  const res = await apiPost<{ id: string }>('/admin/coupons', opts);
  return res.id;
}

export async function adminUpdateCouponStatus(
  couponId: string,
  status: CouponStatus
): Promise<void> {
  await apiPatch(`/admin/coupons/${couponId}/status`, {
    ...(await authed()),
    body: { status },
  });
}

export async function adminListCouponIssuances(
  couponId: string,
  params: AdminIssuanceListParams = {}
): Promise<PaginatedResponse<IssuanceRow>> {
  const { data, meta } = await apiGetList<IssuanceRow>(
    `/admin/coupons/${couponId}/issuances${buildIssuancesQuery(params)}`,
    await authed()
  );
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function adminIssueCouponByEmail(
  couponId: string,
  email: string
): Promise<void> {
  await apiPost(`/admin/coupons/${couponId}/issuances`, {
    ...(await authed()),
    body: { email },
  });
}

export async function adminRevokeIssuance(
  couponId: string,
  issuanceId: string
): Promise<void> {
  await apiPatch(`/admin/coupons/${couponId}/issuances/${issuanceId}/revoke`, await authed());
}
