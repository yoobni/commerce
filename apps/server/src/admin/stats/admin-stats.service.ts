import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';
import type { OrderStatus, User } from '@commerce/types';

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

function dayBounds(daysAgo: number): { start: string; end: string } {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  const start = d.toISOString();
  d.setHours(23, 59, 59, 999);
  const end = d.toISOString();
  return { start, end };
}

@Injectable()
export class AdminStatsService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async dashboard(): Promise<DashboardStats> {
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
      (this.supabase.from('orders') as any)
        .select('*', { count: 'exact', head: true })
        .gte('ordered_at', today.start)
        .lte('ordered_at', today.end),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.supabase.from('orders') as any)
        .select('*', { count: 'exact', head: true })
        .gte('ordered_at', yesterday.start)
        .lte('ordered_at', yesterday.end),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.supabase.from('orders') as any)
        .select('total_amount')
        .gte('ordered_at', today.start)
        .lte('ordered_at', today.end)
        .not('status', 'in', '(CANCELLED,REFUNDED)'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.supabase.from('orders') as any)
        .select('total_amount')
        .gte('ordered_at', yesterday.start)
        .lte('ordered_at', yesterday.end)
        .not('status', 'in', '(CANCELLED,REFUNDED)'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.supabase.from('users') as any)
        .select('*', { count: 'exact', head: true })
        .neq('status', 'WITHDRAWN'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.supabase.from('users') as any)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.start)
        .lte('created_at', today.end),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.supabase.from('products') as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.supabase.from('products') as any).select('*', { count: 'exact', head: true }),
    ]);

    const sumRevenue = (rows: Array<{ total_amount: number }> | null) =>
      (rows ?? []).reduce((acc, r) => acc + (r.total_amount ?? 0), 0);

    return {
      todayOrders: todayOrders ?? 0,
      yesterdayOrders: yesterdayOrders ?? 0,
      todayRevenue: sumRevenue(todayRevenueData as Array<{ total_amount: number }> | null),
      yesterdayRevenue: sumRevenue(
        yesterdayRevenueData as Array<{ total_amount: number }> | null
      ),
      totalMembers: totalMembers ?? 0,
      newMembersToday: newMembersToday ?? 0,
      activeProducts: activeProducts ?? 0,
      totalProducts: totalProducts ?? 0,
    };
  }

  async weeklySales(): Promise<DailyStat[]> {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('orders') as any)
      .select('ordered_at, total_amount, status')
      .gte('ordered_at', start.toISOString())
      .not('status', 'in', '(CANCELLED,REFUNDED)');

    const map: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = { revenue: 0, orders: 0 };
    }

    for (const row of (data ?? []) as Array<{
      ordered_at: string;
      total_amount: number | null;
    }>) {
      const key = row.ordered_at.slice(0, 10);
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

  async recentOrders(limit = 5): Promise<RecentOrderRow[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('orders') as any)
      .select(
        'id, order_number, currency, total_amount, status, ordered_at, user:users!user_id(id, name, email)'
      )
      .order('ordered_at', { ascending: false })
      .limit(limit);
    return (data ?? []) as RecentOrderRow[];
  }

  async orderStatusCounts(): Promise<Record<string, number>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('orders') as any).select('status');
    const counts: Record<string, number> = {};
    for (const row of (data ?? []) as Array<{ status: string }>) {
      counts[row.status] = (counts[row.status] ?? 0) + 1;
    }
    return counts;
  }
}
