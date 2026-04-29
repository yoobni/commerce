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

export interface PeriodStats {
  revenue: number;
  orders: number;
  newMembers: number;
  avgOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  membersChange: number;
}

export interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'member';
  label: string;
  detail: string;
  time: string;
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

export async function getOrderStatusCounts(): Promise<Record<string, number>> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('orders') as any).select('status');

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const s = row.status as string;
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return counts;
}

// ─── Period stats ─────────────────────────────────────────────────────────────

export async function getPeriodStats(days: number): Promise<PeriodStats> {
  const supabase = createServiceClient();
  const now = new Date();

  const curStart = new Date(now);
  curStart.setDate(curStart.getDate() - days);
  curStart.setHours(0, 0, 0, 0);

  const prevStart = new Date(curStart);
  prevStart.setDate(prevStart.getDate() - days);
  const prevEnd = new Date(curStart.getTime() - 1);

  const [
    { data: curOrderData },
    { data: prevOrderData },
    { count: curMembers },
    { count: prevMembers },
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('total_amount')
      .gte('ordered_at', curStart.toISOString())
      .not('status', 'in', '(CANCELLED,REFUNDED)'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('total_amount')
      .gte('ordered_at', prevStart.toISOString())
      .lte('ordered_at', prevEnd.toISOString())
      .not('status', 'in', '(CANCELLED,REFUNDED)'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('users') as any)
      .select('*', { count: 'exact', head: true })
      .gte('created_at', curStart.toISOString())
      .neq('status', 'WITHDRAWN'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('users') as any)
      .select('*', { count: 'exact', head: true })
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString())
      .neq('status', 'WITHDRAWN'),
  ]);

  const sumRevenue = (rows: Array<{ total_amount: number }> | null) =>
    (rows ?? []).reduce((acc, r) => acc + (r.total_amount ?? 0), 0);

  const curRevenue = sumRevenue(curOrderData as Array<{ total_amount: number }> | null);
  const prevRevenue = sumRevenue(prevOrderData as Array<{ total_amount: number }> | null);
  const curOrderCount = (curOrderData ?? []).length;
  const prevOrderCount = (prevOrderData ?? []).length;
  const curMemberCount = curMembers ?? 0;
  const prevMemberCount = prevMembers ?? 0;

  const pctChange = (cur: number, prev: number): number =>
    prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 1000) / 10;

  return {
    revenue: curRevenue,
    orders: curOrderCount,
    newMembers: curMemberCount,
    avgOrderValue: curOrderCount > 0 ? Math.round(curRevenue / curOrderCount) : 0,
    revenueChange: pctChange(curRevenue, prevRevenue),
    ordersChange: pctChange(curOrderCount, prevOrderCount),
    membersChange: pctChange(curMemberCount, prevMemberCount),
  };
}

// ─── Period trend ─────────────────────────────────────────────────────────────

export async function getPeriodTrend(days: number): Promise<DailyStat[]> {
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

  return Object.entries(map).map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }));
}

// ─── Top products (last 30 days) ──────────────────────────────────────────────

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const supabase = createServiceClient();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('order_items') as any)
    .select('product_snapshot, quantity, total_price')
    .gte('created_at', start.toISOString());

  const map: Record<string, TopProduct> = {};
  for (const item of data ?? []) {
    const snap = item.product_snapshot as { product_id?: string; name?: string } | null;
    const pid = snap?.product_id;
    if (!pid) continue;
    if (!map[pid]) {
      map[pid] = { id: pid, name: snap?.name ?? '알 수 없음', quantity: 0, revenue: 0 };
    }
    map[pid].quantity += item.quantity ?? 0;
    map[pid].revenue += item.total_price ?? 0;
  }

  return Object.values(map)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

// ─── Recent activity (for realtime alerts) ────────────────────────────────────

export async function getRecentActivity(minutes = 60): Promise<ActivityItem[]> {
  const supabase = createServiceClient();
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();

  const [{ data: orders }, { data: members }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('id, order_number, total_amount, ordered_at, user:users!user_id(name)')
      .gte('ordered_at', since)
      .order('ordered_at', { ascending: false })
      .limit(10),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('users') as any)
      .select('id, name, email, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const items: ActivityItem[] = [
    ...(orders ?? []).map((o: Record<string, unknown>) => ({
      id: `order-${o.id as string}`,
      type: 'order' as const,
      label: `신규 주문 #${o.order_number as string}`,
      detail: `${((o.total_amount as number) ?? 0).toLocaleString()}원 · ${(o.user as { name?: string } | null)?.name ?? '비회원'}`,
      time: o.ordered_at as string,
    })),
    ...(members ?? []).map((u: Record<string, unknown>) => ({
      id: `member-${u.id as string}`,
      type: 'member' as const,
      label: '신규 회원 가입',
      detail: (u.name as string) || (u.email as string),
      time: u.created_at as string,
    })),
  ];

  return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);
}
