import Link from 'next/link';
import type { OrderStatus } from '@commerce/types';
import { getDashboardStats, type DailyStatRow } from '@/lib/queries/stats';
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE } from '@/lib/queries/orders';

export const metadata = { title: '대시보드' };

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        accent
          ? 'bg-[var(--color-sidebar)] border-[var(--color-sidebar)] text-white'
          : 'bg-white border-[var(--color-border)]'
      }`}
    >
      <p className={`text-xs font-medium mb-1 ${accent ? 'text-white/70' : 'text-[var(--color-text-secondary)]'}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold ${accent ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs mt-1 ${accent ? 'text-white/60' : 'text-[var(--color-text-tertiary)]'}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Mini bar chart (pure CSS) ────────────────────────────────────────────────

type BarChartValueKey = 'orderCount' | 'revenue';

function BarChart({
  data,
  valueKey,
  color,
}: {
  data: DailyStatRow[];
  valueKey: BarChartValueKey;
  color: string;
}) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => {
        const pct = Math.round((d[valueKey] / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t ${color} transition-all`}
              style={{ height: `${Math.max(pct, 2)}%` }}
              title={`${d.date}: ${d[valueKey]}`}
            />
            <span className="text-[9px] text-[var(--color-text-tertiary)] leading-none">
              {d.date}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const todayRevenueFormatted = stats.todayRevenue.toLocaleString('ko-KR');
  const weekRevenueFormatted = stats.weekRevenue.toLocaleString('ko-KR');

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">대시보드</h1>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="오늘 주문"
          value={`${stats.todayOrders}건`}
          sub={`₩${todayRevenueFormatted}`}
          accent
        />
        <KpiCard
          label="주간 주문"
          value={`${stats.weekOrders}건`}
          sub={`₩${weekRevenueFormatted}`}
        />
        <KpiCard
          label="전체 회원"
          value={`${stats.totalMembers.toLocaleString()}명`}
          sub={`오늘 +${stats.newMembersToday}명`}
        />
        <KpiCard
          label="처리 대기"
          value={`${stats.pendingOrders}건`}
          sub={`반품/환불 ${stats.returnRequests}건`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Daily orders */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            일별 주문 수 <span className="font-normal text-[var(--color-text-secondary)]">(최근 7일)</span>
          </h2>
          <BarChart
            data={stats.dailyStats}
            valueKey="orderCount"
            color="bg-indigo-400"
          />
        </section>

        {/* Daily revenue */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            일별 매출 <span className="font-normal text-[var(--color-text-secondary)]">(최근 7일, KRW)</span>
          </h2>
          <BarChart
            data={stats.dailyStats}
            valueKey="revenue"
            color="bg-violet-400"
          />
        </section>
      </div>

      {/* Quick shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { href: '/orders?status=PENDING_PAYMENT', label: '결제 대기', count: null },
          { href: '/orders?status=RETURN_REQUESTED', label: '반품 요청', count: null },
          { href: '/orders?status=REFUND_REQUESTED', label: '환불 요청', count: null },
          { href: '/members?status=SUSPENDED', label: '정지 회원', count: null },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="bg-white border border-[var(--color-border)] rounded-xl p-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-gray-50 transition-colors text-center"
          >
            {label} →
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <section className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">최근 주문</h2>
          <Link href="/orders" className="text-xs text-blue-600 hover:underline">
            전체 보기
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-sm text-center text-[var(--color-text-tertiary)]">
            주문이 없습니다.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문번호</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">고객</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">금액</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {order.user_name ? (
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{order.user_name}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">{order.user_email}</p>
                      </div>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    {order.total_amount.toLocaleString()} {order.currency}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        ORDER_STATUS_BADGE[order.status as OrderStatus] ?? 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {new Date(order.ordered_at).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
