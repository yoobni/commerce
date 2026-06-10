// Admin orders API client. Server-side only.

import type {
  Order,
  OrderItem,
  OrderStatus,
  PaginatedResponse,
  Payment,
  User,
} from '@commerce/types';
import { apiGetList, apiGetOne, apiPatch, apiPost } from './client';
import { getAdminToken } from './auth';

export interface AdminOrderRow {
  id: string;
  order_number: string;
  user: Pick<User, 'id' | 'name' | 'email'> | null;
  currency: string;
  total_amount: number;
  status: OrderStatus;
  ordered_at: string;
}

export interface AdminOrderDetail extends Order {
  user: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null;
  items: OrderItem[];
  payment: Payment | null;
}

export interface AdminListOrdersParams {
  status?: OrderStatus | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

function buildQuery(params: AdminListOrdersParams): string {
  const sp = new URLSearchParams();
  if (params.status && params.status !== 'ALL') sp.set('status', params.status);
  if (params.search) sp.set('search', params.search);
  if (params.page) sp.set('page', String(params.page));
  if (params.per_page) sp.set('per_page', String(params.per_page));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

async function authed() {
  const accessToken = await getAdminToken();
  return { accessToken, noStore: true } as const;
}

export async function adminListOrders(
  params: AdminListOrdersParams = {}
): Promise<PaginatedResponse<AdminOrderRow>> {
  const { data, meta } = await apiGetList<AdminOrderRow>(
    `/admin/orders${buildQuery(params)}`,
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

export async function adminGetOrder(id: string): Promise<AdminOrderDetail | null> {
  try {
    return await apiGetOne<AdminOrderDetail>(`/admin/orders/${id}`, await authed());
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function adminUpdateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  await apiPatch(`/admin/orders/${id}/status`, { ...(await authed()), body: { status } });
}

export async function adminUpdateOrderMemo(id: string, memo: string): Promise<void> {
  await apiPatch(`/admin/orders/${id}/memo`, { ...(await authed()), body: { memo } });
}

export async function adminProcessRefund(id: string, amount: number): Promise<void> {
  await apiPost(`/admin/orders/${id}/refund`, { ...(await authed()), body: { amount } });
}
