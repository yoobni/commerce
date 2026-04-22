/**
 * Admin dashboard KPI queries — service-role client (bypasses RLS).
 * All aggregations are computed server-side in JS after targeted Supabase fetches.
 */

import type { OrderStatus, Currency } from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RevenueKPI {
  today: number;  // KRW
  week: number;
  month: number;
  currency: Currency;
}

export interface OrderCountKPI {
  today: number;
  week: number;
  month: number;
  total_active: number;
}

export interface MemberKPI {
  today: number;
  week: number;
  month: number;
  total: number;
}

export type OrderStatusCounts = Record<OrderStatus, number>;

export interface LowStockProduct {
  option_id: string;
  product_id: string;
  name_ko: string;
  sku: string;
  stock: number;
  low_stock_threshold: number;
  color: string;
  size_label: string | null;
}

export interface RecentOrderRow {
  id: string;
  order_number: string;
  user_name: string | null;
  user_email: string | null;
  status: OrderStatus;
  total_amount: number;
  currency: Currency;
  ordered_at: string;
}

export interface DailyRevenue {
  date: string;   // YYYY-MM-DD
  amount: number; // KRW
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function todayStartISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function weekStartISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function monthStartISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Statuses that indicate a non-revenue order (excluded from revenue KPI). */
const EXCLUDED_STATUSES: OrderStatus[] = [
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUND_REQUESTED',
  'REFUNDED',
  'DELIVERY_FAILED',
];

const ALL_ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CONFIRMED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUND_REQUESTED',
  'REFUNDED',
  'CANCELLED',
  'DELIVERY_FAILED',
];

// ─── Revenue KPI ──────────────────────────────────────────────────────────────

export async function adminGetRevenueKPI(): Promise<RevenueKPI> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from('orders') as any)
    .select('total_amount, ordered_at')
    .gte('ordered_at', monthStartISO());

  for (const s of EXCLUDED_STATUSES) {
    q = q.neq('status', s);
  }

  const { data, error } = await q;
  if (error) throw error;

  const rows = (data ?? []) as { total_amount: number; ordered_at: string }[];
  const todayStart = todayStartISO();
  const weekStart = weekStartISO();

  return {
    today: rows
      .filter((r) => r.ordered_at >= todayStart)
      .reduce((s, r) => s + r.total_amount, 0),
    week: rows
      .filter((r) => r.ordered_at >= weekStart)
      .reduce((s, r) => s + r.total_amount, 0),
    month: rows.reduce((s, r) => s + r.total_amount, 0),
    currency: 'KRW',
  };
}

// ─── Order count KPI ──────────────────────────────────────────────────────────

export async function adminGetOrderCountKPI(): Promise<OrderCountKPI> {
  const supabase = createServiceClient();

  // Recent 30-day orders (all statuses) for date-bucketed counts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('orders') as any)
    .select('ordered_at')
    .gte('ordered_at', monthStartISO());
  if (error) throw error;

  const rows = (data ?? []) as { ordered_at: string }[];
  const todayStart = todayStartISO();
  const weekStart = weekStartISO();

  // All-time active order count (excludes cancelled/refunded)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let totalQ = (supabase.from('orders') as any).select('*', {
    count: 'exact',
    head: true,
  });
  for (const s of EXCLUDED_STATUSES) {
    totalQ = totalQ.neq('status', s);
  }
  const { count: totalCount } = await totalQ;

  return {
    today: rows.filter((r) => r.ordered_at >= todayStart).length,
    week: rows.filter((r) => r.ordered_at >= weekStart).length,
    month: rows.length,
    total_active: totalCount ?? 0,
  };
}

// ─── Order status counts ──────────────────────────────────────────────────────

export async function adminGetOrderStatusCounts(): Promise<OrderStatusCounts> {
  const supabase = createServiceClient();

  const counts = await Promise.all(
    ALL_ORDER_STATUSES.map(async (status) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase.from('orders') as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      return [status, count ?? 0] as const;
    })
  );

  return Object.fromEntries(counts) as OrderStatusCounts;
}

// ─── Member KPI ───────────────────────────────────────────────────────────────

export async function adminGetMemberKPI(): Promise<MemberKPI> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('users') as any)
    .select('created_at')
    .gte('created_at', monthStartISO());
  if (error) throw error;

  const rows = (data ?? []) as { created_at: string }[];
  const todayStart = todayStartISO();
  const weekStart = weekStartISO();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: totalCount } = await (supabase.from('users') as any).select('*', {
    count: 'exact',
    head: true,
  });

  return {
    today: rows.filter((r) => r.created_at >= todayStart).length,
    week: rows.filter((r) => r.created_at >= weekStart).length,
    month: rows.length,
    total: totalCount ?? 0,
  };
}

// ─── Low stock products ───────────────────────────────────────────────────────

export async function adminGetLowStockProducts(): Promise<LowStockProduct[]> {
  const supabase = createServiceClient();

  // Fetch options with stock <= 10 as a broad pre-filter,
  // then narrow to stock <= low_stock_threshold in JS
  // (PostgREST does not support column-to-column comparisons directly)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('product_options') as any)
    .select(
      `id, sku, stock, low_stock_threshold, color,
       product:products!product_id(id, name_ko),
       size:sizes!size_id(label)`
    )
    .lte('stock', 10)
    .eq('is_active', true)
    .order('stock', { ascending: true })
    .limit(50);

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[])
    .filter((o: any) => o.stock <= o.low_stock_threshold)
    .map((o: any) => ({
      option_id: o.id as string,
      product_id: (o.product?.id ?? '') as string,
      name_ko: (o.product?.name_ko ?? '') as string,
      sku: o.sku as string,
      stock: o.stock as number,
      low_stock_threshold: o.low_stock_threshold as number,
      color: o.color as string,
      size_label: (o.size?.label ?? null) as string | null,
    }));
}

// ─── Recent orders ────────────────────────────────────────────────────────────

export async function adminGetRecentOrders(): Promise<RecentOrderRow[]> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('orders') as any)
    .select(
      `id, order_number, status, total_amount, currency, ordered_at,
       user:users!user_id(name, email)`
    )
    .order('ordered_at', { ascending: false })
    .limit(15);

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((row: any) => ({
    id: row.id as string,
    order_number: row.order_number as string,
    user_name: (row.user?.name ?? null) as string | null,
    user_email: (row.user?.email ?? null) as string | null,
    status: row.status as OrderStatus,
    total_amount: row.total_amount as number,
    currency: row.currency as Currency,
    ordered_at: row.ordered_at as string,
  }));
}

// ─── Daily revenue (30 days) ──────────────────────────────────────────────────

export async function adminGetDailyRevenue(): Promise<DailyRevenue[]> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from('orders') as any)
    .select('total_amount, ordered_at')
    .gte('ordered_at', monthStartISO())
    .order('ordered_at', { ascending: true });

  for (const s of EXCLUDED_STATUSES) {
    q = q.neq('status', s);
  }

  const { data, error } = await q;
  if (error) throw error;

  const byDate = new Map<string, number>();
  for (const row of (data ?? []) as { total_amount: number; ordered_at: string }[]) {
    const date = row.ordered_at.slice(0, 10);
    byDate.set(date, (byDate.get(date) ?? 0) + row.total_amount);
  }

  const result: DailyRevenue[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    result.push({ date, amount: byDate.get(date) ?? 0 });
  }
  return result;
}
