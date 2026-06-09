import type { Order, OrderWithItems, PaginatedResponse } from '@commerce/types';
import { apiGetList, apiGetOne, ApiCallError } from './client';
import { getAccessToken } from './auth';

/** Server-side: authenticated viewer's orders, [] if anonymous. */
export async function listUserOrders({
  page = 1,
  per_page = 10,
}: { page?: number; per_page?: number } = {}): Promise<PaginatedResponse<Order>> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) {
    return { data: [], total: 0, page, per_page, has_next: false };
  }
  const sp = new URLSearchParams();
  sp.set('page', String(page));
  sp.set('per_page', String(per_page));
  const { data, meta } = await apiGetList<Order>(`/orders/me?${sp.toString()}`, {
    accessToken,
    noStore: true,
  });
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) return null;
  try {
    return await apiGetOne<OrderWithItems>(
      `/orders/me/${encodeURIComponent(orderId)}`,
      { accessToken, noStore: true }
    );
  } catch (e) {
    if (e instanceof ApiCallError && e.status === 404) return null;
    throw e;
  }
}
