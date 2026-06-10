// Admin stats API client. Server-side only.

import type { OrderStatus, User } from '@commerce/types';
import { apiGetOne } from './client';
import { getAdminToken } from './auth';

export interface DashboardStats {
  todayOrders: number;
  yesterdayOrders: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  totalMembers: number;
  newMembersToday: number;
  activeProducts: number;
  totalProducts: number;
}

export interface DailyStat {
  date: string;
  revenue: number;
  orders: number;
}

export interface RecentOrderRow {
  id: string;
  order_number: string;
  currency: string;
  total_amount: number;
  status: OrderStatus;
  ordered_at: string;
  user: Pick<User, 'id' | 'name' | 'email'> | null;
}

async function authed() {
  const accessToken = await getAdminToken();
  return { accessToken, noStore: true } as const;
}

export async function adminGetDashboardStats(): Promise<DashboardStats> {
  return apiGetOne<DashboardStats>('/admin/stats/dashboard', await authed());
}

export async function adminGetWeeklySalesTrend(): Promise<DailyStat[]> {
  return apiGetOne<DailyStat[]>('/admin/stats/weekly-sales', await authed());
}

export async function adminGetRecentOrders(limit = 5): Promise<RecentOrderRow[]> {
  return apiGetOne<RecentOrderRow[]>(
    `/admin/stats/recent-orders?limit=${limit}`,
    await authed()
  );
}

export async function adminGetOrderStatusCounts(): Promise<Record<string, number>> {
  return apiGetOne<Record<string, number>>('/admin/stats/order-status-counts', await authed());
}
