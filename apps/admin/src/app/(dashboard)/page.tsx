import Link from 'next/link';
import { Suspense } from 'react';
import type { OrderStatus } from '@commerce/types';
import {
  getDashboardStats,
  getPeriodStats,
  getPeriodTrend,
  getRecentOrders,
  getOrderStatusCounts,
  getTopProducts,
  getRecentActivity,
  type DailyStat,
} from '@/lib/queries/stats';
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE } from '@/lib/queries/orders';
import { KpiCard } from '@/components/ui/KpiCard';
import { MiniChart } from '@/components/ui/MiniChart';
import { Badge } from '@/components/ui/Badge';
import { PeriodSelector } from './_components/PeriodSelector';
import { RealtimeAlerts } from './_components/RealtimeAlerts';

export const metadata = { title: '대시보드' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function trendText(
  today: number,
  yesterday: number
): { direction: 'up' | 'down' | 'neutral'; text: string } {
  if (yesterday === 0) {
    if (today === 0) return { direction: 'neutral', text: '전일 대비 동일' };
    return { direction: 'up', text: '전일 대비 신규' };
  }
  const pct = ((today - yesterday) / yesterday) * 100;
  if (Math.abs(pct) < 0.5) return { direction: 'neutral', text: '전일 대비 동일' };
  const sign = pct > 0 ? '+' : '';
  return {
    direction: pct > 0 ? 'up' : 'down',
    text: `${sign}${pct.toFixed(1)}% 전일 대비`,
  };
}

function pctTrend(change: number): { direction: 'up' | 'down' | 'neutral'; text: string } {
  if (Math.abs(change) < 0.5) return { direction: 'neutral', text: '전기 대비 동일' };
  const sign = change > 0 ? '+' : '';
  return {
    direction: change > 0 ? 'up' : 'down',
    text: `${sign}${change.toFixed(1)}% 전기 대비`,
  };
}

function formatKRW(amount: number): string {
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}억원`;
  if (amount >= 10_000) return `${(amount / 10_000).toFixed(1)}만원`;
  return `${amount.toLocaleString()}원`;
}

// ─── Period trend bar chart ───────────────────────────────────────────────────

function buildBars(data: DailyStat[], days: number): Array<DailyStat & { label: string }> {
  if (days <= 30) {
    return data.map((d) => {
      const date = new Date(d.date + 'T12:00:00');
      const label =
        days === 7
          ? ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
          : String(date.getDate());
      return { ...d, label };
    });
  }
  // 90-day: group by week
  const weeks: Record<string, DailyStat & { label: string }> = {};
  for (const d of data) {
    const date = new Date(d.date + 'T12:00:00');
    const sun = new Date(date);
    sun.setDate(date.getDate() - date.getDay());
    const key = sun.toISOString().slice(0, 10);
    if (!weeks[key]) {
      const label = `${sun.getMonth() + 1}/${sun.getDate()}`;
      weeks[key] = { date: key, revenue: 0, orders: 0, label };
    }
    weeks[key].revenue += d.revenue;
    weeks[key].orders += d.orders;
  }
  return Object.values(weeks);
}

function PeriodTrendChart({
  data,
  days,
}: {
  data: DailyStat[];
  days: number;
}) {
  const bars = buildBars(data, days);
  const maxRevenue = Math.max(...bars.map((d) => d.revenue), 1);
  const showEvery = bars.length > 15 ? Math.ceil(bars.length / 10) : 1;

  return (
    <div
      className="bg-white border border-[var(--color-border)] rounded-xl p-5"
      role="img"
      aria-label={`최근 ${days}일 매출 추이`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">매출 추이</h2>
        <span className="text-xs text-[var(--color-text-tertiary)]">최근 {days}일</span>
      </div>
      <div className="flex items-end gap-1 h-32" aria-hidden="true">
        {bars.map((d, i) => {
          const heightPct = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
          return (
            <div key={d.date} className="flex flex-col items-center gap-1 flex-1 group">
              <div className="relative flex flex-col justify-end w-full h-24 cursor-default">
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <p className="font-medium">{formatKRW(d.revenue)}</p>
                  <p className="text-gray-300">{d.orders}건</p>
                </div>
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${Math.max(heightPct, d.revenue > 0 ? 4 : 0)}%`,
                    background: 'var(--color-brand-accent)',
                    opacity: 0.85,
                  }}
                />
              </div>
              <span className="text-[10px] text-[var(--color-text-tertiary)]">
                {i % showEvery === 0 ? d.label : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Order status distribution ────────────────────────────────────────────────

const STATUS_KO: Record<string, string> = {
  PAID: '결제완료',
  PREPARING: '준비중',
  SHIPPED: '배송중',
  DELIVERED: '배송완료',
  CONFIRMED: '구매확정',
  RETURN_REQUESTED: '반품요청',
  RETURNED: '반품완료',
  REFUND_REQUESTED: '환불요청',
  REFUNDED: '환불완료',
  CANCELLED: '취소',
  PENDING_PAYMENT: '결제대기',
  DELIVERY_FAILED: '배송실패',
};

const STATUS_COLOR: Record<string, string> = {
  PAID: 'bg-blue-400',
  PREPARING: 'bg-amber-400',
  SHIPPED: 'bg-purple-400',
  DELIVERED: 'bg-indigo-400',
  CONFIRMED: 'bg-emerald-500',
  RETURN_REQUESTED: 'bg-orange-400',
  RETURNED: 'bg-orange-500',
  REFUND_REQUESTED: 'bg-red-400',
  REFUNDED: 'bg-red-500',
  CANCELLED: 'bg-gray-400',
  PENDING_PAYMENT: 'bg-yellow-400',
  DELIVERY_FAILED: 'bg-rose-500',
};

function OrderStatusChart({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">주문 상태 분포</h2>
        <span className="text-xs text-[var(--color-text-tertiary)]">전체 {total.toLocaleString()}건</span>
      </div>
      <div className="space-y-2.5">
        {entries.map(([status, count]) => {
          const pct = Math.round((count / total) * 100);
          return (
            <div key={status}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {STATUS_KO[status] ?? status}
                </span>
                <span className="text-xs font-medium text-[var(--color-text-primary)]">
                  {count.toLocaleString()}건 ({pct}%)
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${STATUS_COLOR[status] ?? 'bg-gray-400'}`}
                  style={{ width: `${Math.max(pct, 1)}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Top products ─────────────────────────────────────────────────────────────

function TopProductsWidget({
  products,
}: {
  products: Array<{ id: string; name: string; quantity: number; revenue: number }>;
}) {
  const maxQty = Math.max(...products.map((p) => p.quantity), 1);

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">인기 상품</h2>
        <span className="text-xs text-[var(--color-text-tertiary)]">최근 30일</span>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-[var(--color-text-tertiary)] py-4 text-center">
          판매 데이터 없음
        </p>
      ) : (
        <ol className="space-y-3">
          {products.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-[10px] font-bold text-[var(--color-text-tertiary)] flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                  {p.name}
                </p>
                <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-brand-accent)] rounded-full opacity-70"
                    style={{ width: `${(p.quantity / maxQty) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                  {p.quantity.toLocaleString()}개
                </p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">
                  {formatKRW(p.revenue)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ─── Quick links ──────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  {
    label: '주문 관리',
    href: '/orders',
    iconPath:
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  { label: '상품 등록', href: '/products/new', iconPath: 'M12 4v16m8-8H4' },
  {
    label: '쿠폰 생성',
    href: '/coupons/new',
    iconPath:
      'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  },
  {
    label: '회원 관리',
    href: '/members',
    iconPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = [7, 30, 90].includes(Number(params.period)) ? Number(params.period) : 30;

  const [stats, periodStats, trend, statusCounts, topProducts, recentActivity, recentOrders] =
    await Promise.all([
      getDashboardStats(),
      getPeriodStats(period),
      getPeriodTrend(period),
      getOrderStatusCounts(),
      getTopProducts(5),
      getRecentActivity(60),
      getRecentOrders(5),
    ]);

  const revenueTrendData = trend.map((d) => d.revenue);
  const orderTrendData = trend.map((d) => d.orders);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">대시보드</h1>

      {/* Daily KPI cards */}
      <section aria-label="오늘 지표">
        <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
          오늘 현황
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="오늘 주문"
            value={stats.todayOrders.toLocaleString()}
            subLabel={`어제: ${stats.yesterdayOrders.toLocaleString()}건`}
            trend={trendText(stats.todayOrders, stats.yesterdayOrders)}
            iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            chart={
              <MiniChart
                data={orderTrendData.length >= 2 ? orderTrendData : [0, 0]}
                color="#3b82f6"
                height={36}
              />
            }
          />
          <KpiCard
            label="오늘 매출"
            value={formatKRW(stats.todayRevenue)}
            subLabel={`어제: ${formatKRW(stats.yesterdayRevenue)}`}
            trend={trendText(stats.todayRevenue, stats.yesterdayRevenue)}
            iconPath="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            chart={
              <MiniChart
                data={revenueTrendData.length >= 2 ? revenueTrendData : [0, 0]}
                color="#f59e0b"
                height={36}
              />
            }
          />
          <KpiCard
            label="총 회원"
            value={stats.totalMembers.toLocaleString()}
            subLabel={`오늘 신규: ${stats.newMembersToday}명`}
            trend={trendText(stats.newMembersToday, 0)}
            iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <KpiCard
            label="판매 상품"
            value={stats.activeProducts.toLocaleString()}
            subLabel={`전체: ${stats.totalProducts.toLocaleString()}개`}
            iconPath="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>
      </section>

      {/* Period KPI cards */}
      <section aria-label="기간별 통계">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
            기간별 통계
          </p>
          <Suspense fallback={null}>
            <PeriodSelector current={String(period)} />
          </Suspense>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label={`${period}일 주문`}
            value={periodStats.orders.toLocaleString()}
            subLabel="취소·환불 제외"
            trend={pctTrend(periodStats.ordersChange)}
            iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KpiCard
            label={`${period}일 매출`}
            value={formatKRW(periodStats.revenue)}
            subLabel="취소·환불 제외"
            trend={pctTrend(periodStats.revenueChange)}
            iconPath="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <KpiCard
            label={`${period}일 신규 회원`}
            value={periodStats.newMembers.toLocaleString()}
            subLabel="탈퇴 제외"
            trend={pctTrend(periodStats.membersChange)}
            iconPath="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <KpiCard
            label="평균 주문액"
            value={formatKRW(periodStats.avgOrderValue)}
            subLabel={`${period}일 기준`}
            iconPath="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
          />
        </div>
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4" aria-label="통계 차트">
        <PeriodTrendChart data={trend} days={period} />
        <OrderStatusChart counts={statusCounts} />
      </section>

      {/* Bottom row: top products + realtime alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4" aria-label="인기 상품 및 실시간 활동">
        <TopProductsWidget products={topProducts} />

        {/* Quick links on small viewport, realtime on lg+ */}
        <div className="flex flex-col gap-4 lg:hidden">
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">빠른 메뉴</h2>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-brand-accent)] hover:bg-amber-50/30 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-amber-100/50 flex items-center justify-center shrink-0 transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand-accent)] transition-colors"
                      aria-hidden="true"
                    >
                      <path d={link.iconPath} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block min-h-64">
          <RealtimeAlerts initial={recentActivity} />
        </div>
      </section>

      {/* Realtime alerts on mobile */}
      <section className="lg:hidden" aria-label="실시간 활동">
        <RealtimeAlerts initial={recentActivity} />
      </section>

      {/* Recent orders */}
      <section aria-label="최근 주문">
        <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)] bg-gray-50">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">최근 주문</h2>
            <Link href="/orders" className="text-xs text-blue-600 hover:underline">
              전체 보기 →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--color-text-tertiary)]">
              아직 주문이 없습니다.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">
                    주문번호
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">
                    고객
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)]">
                    금액
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">
                    상태
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">
                    주문일
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-mono text-xs text-blue-600 hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      {order.user ? (
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">
                            {order.user.name}
                          </p>
                          <p className="text-xs text-[var(--color-text-tertiary)]">
                            {order.user.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-tertiary)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-[var(--color-text-primary)]">
                      {order.total_amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={ORDER_STATUS_BADGE[order.status as OrderStatus]}>
                        {ORDER_STATUS_LABEL[order.status as OrderStatus]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-[var(--color-text-secondary)]">
                      {new Date(order.ordered_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
