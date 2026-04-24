/**
 * Admin stats queries — uses service-role client (bypasses RLS).
 * Returns KPI data and chart series for the dashboard.
 */

import { createServiceClient } from '@/lib/supabase/service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  // KPI
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  totalMembers: number;
  newMembersToday: number;
  pendingOrders: number; // PENDING_PAYMENT + PAID + PREPARING
  returnRequests: number; // RETURN_REQUESTED + REFUND_REQUESTED
  // 7-day chart data
  dailyStats: DailyStatRow[];
  // Recent orders
  recentOrders: RecentOrderRow[];
}

export interface DailyStatRow {
  date: string; // 'MM/DD'
  orderCount: number;
  revenue: number;
}

export interface RecentOrderRow {
  id: string;
  order_number: string;
  user_name: string | null;
  user_email: string | null;
  total_amount: number;
  currency: string;
  status: string;
  ordered_at: string;
}

// ─── Query ────────────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServiceClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString();

  // Run queries in parallel
  const [
    todayOrdersRes,
    weekOrdersRes,
    totalMembersRes,
    newMembersTodayRes,
    pendingOrdersRes,
    returnRequestsRes,
    recentOrdersRes,
  ] = await Promise.all([
    // Today orders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('total_amount', { count: 'exact' })
      .gte('ordered_at', todayStart)
      .neq('status', 'CANCELLED'),

    // Week orders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('total_amount, ordered_at', { count: 'exact' })
      .gte('ordered_at', weekStart)
      .neq('status', 'CANCELLED'),

    // Total members
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('users') as any)
      .select('id', { count: 'exact', head: true })
      .neq('status', 'WITHDRAWN'),

    // New members today
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('users') as any)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart),

    // Pending orders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('id', { count: 'exact', head: true })
      .in('status', ['PENDING_PAYMENT', 'PAID', 'PREPARING']),

    // Return/refund requests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('id', { count: 'exact', head: true })
      .in('status', ['RETURN_REQUESTED', 'REFUND_REQUESTED']),

    // Recent 5 orders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any)
      .select('id, order_number, total_amount, currency, status, ordered_at, user:users!user_id(name, email)')
      .order('ordered_at', { ascending: false })
      .limit(5),
  ]);

  // Today KPI
  const todayOrders = todayOrdersRes.count ?? 0;
  const todayRevenue = ((todayOrdersRes.data ?? []) as { total_amount: number }[])
    .reduce((sum, o) => sum + o.total_amount, 0);

  // Week KPI
  const weekOrders = weekOrdersRes.count ?? 0;
  const weekOrders7d = (weekOrdersRes.data ?? []) as { total_amount: number; ordered_at: string }[];
  const weekRevenue = weekOrders7d.reduce((sum, o) => sum + o.total_amount, 0);

  // Build daily stats (last 7 days)
  const dailyMap = new Map<string, { orderCount: number; revenue: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    dailyMap.set(key, { orderCount: 0, revenue: 0 });
  }
  for (const order of weekOrders7d) {
    const d = new Date(order.ordered_at);
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    const existing = dailyMap.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.revenue += order.total_amount;
    }
  }
  const dailyStats: DailyStatRow[] = Array.from(dailyMap.entries()).map(([date, v]) => ({
    date,
    ...v,
  }));

  // Recent orders
  type RawOrder = {
    id: string;
    order_number: string;
    total_amount: number;
    currency: string;
    status: string;
    ordered_at: string;
    user: { name: string; email: string } | null;
  };
  const recentOrders: RecentOrderRow[] = ((recentOrdersRes.data ?? []) as RawOrder[]).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    user_name: o.user?.name ?? null,
    user_email: o.user?.email ?? null,
    total_amount: o.total_amount,
    currency: o.currency,
    status: o.status,
    ordered_at: o.ordered_at,
  }));

  return {
    todayOrders,
    todayRevenue,
    weekOrders,
    weekRevenue,
    totalMembers: totalMembersRes.count ?? 0,
    newMembersToday: newMembersTodayRes.count ?? 0,
    pendingOrders: pendingOrdersRes.count ?? 0,
    returnRequests: returnRequestsRes.count ?? 0,
    dailyStats,
    recentOrders,
  };
}
