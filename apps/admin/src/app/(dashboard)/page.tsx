import Link from 'next/link';
import type { OrderStatus } from '@commerce/types';
import { getDashboardStats, getWeeklySalesTrend, getRecentOrders } from '@/lib/queries/stats';
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE } from '@/lib/queries/orders';
import { KpiCard } from '@/components/ui/KpiCard';
import { MiniChart } from '@/components/ui/MiniChart';
import { Badge } from '@/components/ui/Badge';

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

function formatKRW(amount: number): string {
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}억원`;
  if (amount >= 10_000) return `${(amount / 10_000).toFixed(1)}만원`;
  return `${amount.toLocaleString()}원`;
}

// ─── Bar chart (weekly revenue) ───────────────────────────────────────────────

function WeeklyBarChart({
  data,
}: {
  data: Array<{ date: string; revenue: number; orders: number }>;
}) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div
      className="bg-white border border-[var(--color-border)] rounded-xl p-5"
      role="img"
      aria-label="주간 매출 추이"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">주간 매출 추이</h2>
        <span className="text-xs text-[var(--color-text-tertiary)]">최근 7일</span>
      </div>
      <div className="flex items-end gap-2 h-32" aria-hidden="true">
        {data.map((d) => {
          const heightPct = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
          const dayLabel = days[new Date(d.date + 'T12:00:00').getDay()];
          return (
            <div key={d.date} className="flex flex-col items-center gap-1.5 flex-1 group">
              <div className="relative flex flex-col justify-end w-full h-24 cursor-default">
                {/* Tooltip */}
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
              <span className="text-xs text-[var(--color-text-tertiary)]">{dayLabel}</span>
            </div>
          );
        })}
      </div>
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

export default async function DashboardPage() {
  const [stats, trend, recentOrders] = await Promise.all([
    getDashboardStats(),
    getWeeklySalesTrend(),
    getRecentOrders(5),
  ]);

  const revenueTrendData = trend.map((d) => d.revenue);
  const orderTrendData = trend.map((d) => d.orders);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">대시보드</h1>

      {/* KPI cards */}
      <section aria-label="핵심 지표">
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

      {/* Charts row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4" aria-label="통계 차트">
        <WeeklyBarChart data={trend} />

        {/* Quick links */}
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
