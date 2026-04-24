/**
 * Admin dashboard statistics — uses service-role client (bypasses RLS).
 */

import { createServiceClient } from '@/lib/supabase/service';
import type { OrderRow } from './orders';

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
    (supabase.from('products') as any)
      .select('*', { count: 'exact', head: true }),
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
    .select('id, order_number, currency, total_amount, status, ordered_at, user:users!user_id(id, name, email)')
    .order('ordered_at', { ascending: false })
    .limit(limit);

  return (data ?? []) as OrderRow[];
}

// ─── Order status distribution ────────────────────────────────────────────────

export async function getOrderStatusCounts(): Promise<Record<string, number>> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('orders') as any)
    .select('status');

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const s = row.status as string;
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return counts;
}
