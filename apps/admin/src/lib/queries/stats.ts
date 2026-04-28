/**
 * Admin dashboard statistics — uses service-role client (bypasses RLS).
 */

import { createServiceClient } from '@/lib/supabase/service';
import type { OrderRow } from './orders';

// ─── Period helpers ───────────────────────────────────────────────────────────

export type StatPeriod = 'today' | 'week' | 'month' | 'year';

export function getPeriodBounds(period: StatPeriod): { start: string; end: string } {
  const now = new Date();
  switch (period) {
    case 'week': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start: start.toISOString(), end: end.toISOString() };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: start.toISOString(), end: end.toISOString() };
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start: start.toISOString(), end: end.toISOString() };
    }
    default: {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start: start.toISOString(), end: end.toISOString() };
    }
  }
}

export function getPrevPeriodBounds(period: StatPeriod): { start: string; end: string } {
  const now = new Date();
  switch (period) {
    case 'week': {
      const start = new Date(now);
      start.setDate(start.getDate() - 13);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(end.getDate() - 7);
      end.setHours(23, 59, 59, 999);
      return { start: start.toISOString(), end: end.toISOString() };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start: start.toISOString(), end: end.toISOString() };
    }
    case 'year': {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return { start: start.toISOString(), end: end.toISOString() };
    }
    default:
      return dayBounds(1);
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

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
  date: string; // YYYY-MM-DD
  revenue: number;
  orders: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dayBounds(daysAgo: number): { start: string; end: string } {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  const start = d.toISOString();
  d.setHours(23, 59, 59, 999);
  const end = d.toISOString();
  return { start, end };
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServiceClient();
  const today = dayBounds(0);
  const yesterday = dayBounds(1);

  const [
    { count: todayOrders },
    { count: yesterdayOrders },
    { data: todayRevenueData },
    { data: yesterdayRevenueData },
    { count: totalMembers },
    { count: newMembersToday },
    { count: activeProducts },
    { count: totalProducts },
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('*', { count: 'exact', head: true })
      .gte('ordered_at', today.start)
      .lte('ordered_at', today.end),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('*', { count: 'exact', head: true })
      .gte('ordered_at', yesterday.start)
      .lte('ordered_at', yesterday.end),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('total_amount')
      .gte('ordered_at', today.start)
      .lte('ordered_at', today.end)
      .not('status', 'in', '(CANCELLED,REFUNDED)'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('total_amount')
      .gte('ordered_at', yesterday.start)
      .lte('ordered_at', yesterday.end)
      .not('status', 'in', '(CANCELLED,REFUNDED)'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('users') as any)
      .select('*', { count: 'exact', head: true })
      .neq('status', 'WITHDRAWN'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('users') as any)
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.start)
      .lte('created_at', today.end),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('products') as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('products') as any).select('*', { count: 'exact', head: true }),
  ]);

  const sumRevenue = (rows: Array<{ total_amount: number }> | null) =>
    (rows ?? []).reduce((acc, r) => acc + (r.total_amount ?? 0), 0);

  return {
    todayOrders: todayOrders ?? 0,
    yesterdayOrders: yesterdayOrders ?? 0,
    todayRevenue: sumRevenue(todayRevenueData as Array<{ total_amount: number }> | null),
    yesterdayRevenue: sumRevenue(yesterdayRevenueData as Array<{ total_amount: number }> | null),
    totalMembers: totalMembers ?? 0,
    newMembersToday: newMembersToday ?? 0,
    activeProducts: activeProducts ?? 0,
    totalProducts: totalProducts ?? 0,
  };
}

// ─── Weekly sales trend ───────────────────────────────────────────────────────

export async function getWeeklySalesTrend(): Promise<DailyStat[]> {
  const supabase = createServiceClient();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('orders') as any)
    .select('ordered_at, total_amount, status')
    .gte('ordered_at', start.toISOString())
    .not('status', 'in', '(CANCELLED,REFUNDED)');

  // Group by date (client-side)
  const map: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = { revenue: 0, orders: 0 };
  }

  for (const row of data ?? []) {
    const key = (row.ordered_at as string).slice(0, 10);
    if (map[key]) {
      map[key].revenue += row.total_amount ?? 0;
      map[key].orders += 1;
    }
  }

  return Object.entries(map).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    orders: v.orders,
  }));
}

// ─── Recent orders ────────────────────────────────────────────────────────────

export async function getRecentOrders(limit = 5): Promise<OrderRow[]> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('orders') as any)
    .select(
      'id, order_number, currency, total_amount, status, ordered_at, user:users!user_id(id, name, email)'
    )
    .order('ordered_at', { ascending: false })
    .limit(limit);

  return (data ?? []) as OrderRow[];
}

// ─── Order status distribution ────────────────────────────────────────────────

export async function getOrderStatusCounts(start?: string, end?: string): Promise<Record<string, number>> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('orders') as any).select('status');
  if (start) query = query.gte('ordered_at', start);
  if (end) query = query.lte('ordered_at', end);
  const { data } = await query;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const s = row.status as string;
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return counts;
}

// ─── Period-specific stats ────────────────────────────────────────────────────

export interface PeriodStats {
  orders: number;
  revenue: number;
  newMembers: number;
  cancelledOrders: number;
}

export async function getPeriodStats(start: string, end: string): Promise<PeriodStats> {
  const supabase = createServiceClient();

  const [
    { data: ordersData },
    { count: newMembers },
    { count: cancelledOrders },
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('total_amount, status')
      .gte('ordered_at', start)
      .lte('ordered_at', end),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('users') as any)
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('*', { count: 'exact', head: true })
      .gte('ordered_at', start)
      .lte('ordered_at', end)
      .in('status', ['CANCELLED', 'REFUNDED']),
  ]);

  const rows = (ordersData ?? []) as Array<{ total_amount: number; status: string }>;
  const validRows = rows.filter((r) => !['CANCELLED', 'REFUNDED'].includes(r.status));
  const revenue = validRows.reduce((acc, r) => acc + (r.total_amount ?? 0), 0);

  return {
    orders: rows.length,
    revenue,
    newMembers: newMembers ?? 0,
    cancelledOrders: cancelledOrders ?? 0,
  };
}

// ─── Member growth trend ──────────────────────────────────────────────────────

export async function getMemberGrowthTrend(days: number): Promise<DailyStat[]> {
  const supabase = createServiceClient();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('users') as any)
    .select('created_at')
    .gte('created_at', start.toISOString());

  const map: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map[d.toISOString().slice(0, 10)] = 0;
  }

  for (const row of data ?? []) {
    const key = (row.created_at as string).slice(0, 10);
    if (key in map) map[key] += 1;
  }

  return Object.entries(map).map(([date, count]) => ({
    date,
    revenue: 0,
    orders: count,
  }));
}

// ─── Top products ─────────────────────────────────────────────────────────────

export interface TopProduct {
  product_id: string;
  name: string;
  thumbnail_url: string;
  revenue: number;
  quantity: number;
}

export async function getTopProducts(
  limit: number,
  start?: string,
  end?: string
): Promise<TopProduct[]> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ordersQuery = (supabase.from('orders') as any)
    .select('id')
    .not('status', 'in', '(CANCELLED,REFUNDED)');
  if (start) ordersQuery = ordersQuery.gte('ordered_at', start);
  if (end) ordersQuery = ordersQuery.lte('ordered_at', end);

  const { data: orders } = await ordersQuery;
  if (!orders?.length) return [];

  const orderIds = (orders as Array<{ id: string }>).map((o) => o.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase.from('order_items') as any)
    .select('product_snapshot, quantity, unit_price, total_price')
    .in('order_id', orderIds);

  const map: Record<string, { name: string; thumbnail_url: string; revenue: number; quantity: number }> = {};
  for (const item of items ?? []) {
    const snap = item.product_snapshot as {
      product_id: string;
      name: string;
      thumbnail_url: string;
    };
    if (!snap?.product_id) continue;
    const id = snap.product_id;
    if (!map[id]) {
      map[id] = { name: snap.name, thumbnail_url: snap.thumbnail_url ?? '', revenue: 0, quantity: 0 };
    }
    map[id].revenue += item.total_price ?? 0;
    map[id].quantity += item.quantity ?? 0;
  }

  return Object.entries(map)
    .map(([product_id, v]) => ({ product_id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// ─── Generalized sales trend ──────────────────────────────────────────────────

export async function getSalesTrend(days: number): Promise<DailyStat[]> {
  const supabase = createServiceClient();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('orders') as any)
    .select('ordered_at, total_amount, status')
    .gte('ordered_at', start.toISOString())
    .not('status', 'in', '(CANCELLED,REFUNDED)');

  const map: Record<string, { revenue: number; orders: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map[d.toISOString().slice(0, 10)] = { revenue: 0, orders: 0 };
  }

  for (const row of data ?? []) {
    const key = (row.ordered_at as string).slice(0, 10);
    if (map[key]) {
      map[key].revenue += row.total_amount ?? 0;
      map[key].orders += 1;
    }
  }

  return Object.entries(map).map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }));
}
