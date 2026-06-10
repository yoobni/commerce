/**
 * Admin dashboard statistics. Forwards to @commerce/server.
 */

import type { OrderRow } from './orders';
import {
  adminGetDashboardStats as apiGetDashboardStats,
  adminGetWeeklySalesTrend as apiGetWeeklySalesTrend,
  adminGetRecentOrders as apiGetRecentOrders,
  adminGetOrderStatusCounts as apiGetOrderStatusCounts,
  type DashboardStats,
  type DailyStat,
  type RecentOrderRow,
} from '@/lib/api/stats';

export type { DashboardStats, DailyStat, RecentOrderRow };

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiGetDashboardStats();
}

export async function getWeeklySalesTrend(): Promise<DailyStat[]> {
  return apiGetWeeklySalesTrend();
}

export async function getRecentOrders(limit = 5): Promise<OrderRow[]> {
  // RecentOrderRow shape matches OrderRow — narrow without runtime cost.
  return (await apiGetRecentOrders(limit)) as unknown as OrderRow[];
}

export async function getOrderStatusCounts(): Promise<Record<string, number>> {
  return apiGetOrderStatusCounts();
}
