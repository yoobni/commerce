import Link from 'next/link';
import {
  ShoppingBag,
  Coins,
  Users as UsersIcon,
  Package,
  Plus,
  Ticket,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import type { OrderStatus } from '@commerce/types';
import { getDashboardStats, getWeeklySalesTrend, getRecentOrders } from '@/lib/queries/stats';
import { ORDER_STATUS_LABEL } from '@/lib/queries/orders';
import {
  Badge,
  type BadgeProps,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type DataTableColumn,
  PageHeader,
} from '@/components/ui';
import { cn } from '@/lib/cn';

export const metadata = { title: '대시보드' };

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function trend(today: number, yesterday: number) {
  if (yesterday === 0) {
    if (today === 0) return { dir: 'neutral' as const, text: '전일 대비 동일' };
    return { dir: 'up' as const, text: '신규' };
  }
  const pct = ((today - yesterday) / yesterday) * 100;
  if (Math.abs(pct) < 0.5) return { dir: 'neutral' as const, text: '전일 대비 동일' };
  const sign = pct > 0 ? '+' : '';
  return {
    dir: pct > 0 ? ('up' as const) : ('down' as const),
    text: `${sign}${pct.toFixed(1)}%`,
  };
}

function formatKRW(amount: number): string {
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}억`;
  if (amount >= 10_000) return `${(amount / 10_000).toFixed(1)}만`;
  return `${amount.toLocaleString()}`;
}

const STATUS_VARIANT: Record<OrderStatus, BadgeProps['variant']> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'accent',
  PREPARING: 'accent',
  SHIPPED: 'accent',
  DELIVERED: 'success',
  CONFIRMED: 'success',
  RETURN_REQUESTED: 'warning',
  RETURNED: 'muted',
  REFUND_REQUESTED: 'destructive',
  REFUNDED: 'muted',
  CANCELLED: 'muted',
  DELIVERY_FAILED: 'destructive',
};

/* ─── KPI card ────────────────────────────────────────────────────────────── */

type KpiProps = {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  trend?: { dir: 'up' | 'down' | 'neutral'; text: string };
};

function Kpi({ label, value, unit, sub, icon: Icon, trend: t }: KpiProps) {
  const TrendIcon = t?.dir === 'up' ? ArrowUpRight : t?.dir === 'down' ? ArrowDownRight : Minus;
  const trendColor =
    t?.dir === 'up'
      ? 'text-[var(--mz-accent)]'
      : t?.dir === 'down'
        ? 'text-destructive'
        : 'text-muted-foreground';
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="font-mono text-[28px] font-semibold leading-none tracking-tight text-foreground">
            {value}
          </span>
          {unit && <span className="text-[13px] text-muted-foreground">{unit}</span>}
        </div>
        <div className="mt-2 flex items-center gap-2 text-[12px]">
          {t && (
            <span className={cn('inline-flex items-center gap-0.5', trendColor)}>
              <TrendIcon className="h-3 w-3" strokeWidth={2} />
              {t.text}
            </span>
          )}
          <span className="text-muted-foreground">{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Weekly bar chart ────────────────────────────────────────────────────── */

function WeeklyBarChart({
  data,
}: {
  data: Array<{ date: string; revenue: number; orders: number }>;
}) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
          주간 매출 추이
        </CardTitle>
        <span className="text-[11px] text-muted-foreground">최근 7일</span>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-end gap-2" role="img" aria-label="주간 매출 추이">
          {data.map((d) => {
            const heightPct = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
            const dayLabel = days[new Date(d.date + 'T12:00:00').getDay()];
            return (
              <div key={d.date} className="group flex flex-1 flex-col items-center gap-1.5">
                <div className="relative flex h-24 w-full cursor-default flex-col justify-end">
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[11px] text-background opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="font-medium">{formatKRW(d.revenue)}원</p>
                    <p className="text-background/70">{d.orders}건</p>
                  </div>
                  <div
                    className="w-full rounded-t bg-[var(--mz-accent)] transition-all"
                    style={{
                      height: `${Math.max(heightPct, d.revenue > 0 ? 4 : 0)}%`,
                      opacity: 0.92,
                    }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Quick links ─────────────────────────────────────────────────────────── */

const QUICK_LINKS = [
  { label: '주문 관리', href: '/orders', icon: ShoppingBag },
  { label: '상품 등록', href: '/products/new', icon: Plus },
  { label: '쿠폰 생성', href: '/coupons/new', icon: Ticket },
  { label: '회원 관리', href: '/members', icon: UsersIcon },
];

function QuickLinks() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          빠른 메뉴
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:border-[var(--mz-accent)] hover:bg-accent/50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted transition-colors group-hover:bg-[var(--mz-accent)] group-hover:text-white">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <span className="text-sm font-medium text-foreground">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Recent orders ───────────────────────────────────────────────────────── */

type RecentOrder = Awaited<ReturnType<typeof getRecentOrders>>[number];

function recentOrderColumns(): DataTableColumn<RecentOrder>[] {
  return [
    {
      key: 'order',
      header: '주문번호',
      cell: (o) => (
        <Link
          href={`/orders/${o.id}`}
          className="font-mono text-[12.5px] text-foreground hover:text-[var(--mz-accent)] hover:underline"
        >
          {o.order_number}
        </Link>
      ),
      width: '180px',
    },
    {
      key: 'customer',
      header: '고객',
      cell: (o) =>
        o.user ? (
          <div>
            <div className="text-[13px] font-medium text-foreground">{o.user.name}</div>
            <div className="text-[11px] text-muted-foreground">{o.user.email}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'amount',
      header: '금액',
      cell: (o) => (
        <span className="font-mono text-[13px] font-medium">
          ₩{o.total_amount.toLocaleString()}
        </span>
      ),
      align: 'right',
    },
    {
      key: 'status',
      header: '상태',
      cell: (o) => (
        <Badge variant={STATUS_VARIANT[o.status as OrderStatus]}>
          {ORDER_STATUS_LABEL[o.status as OrderStatus]}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: '주문일',
      cell: (o) => (
        <span className="text-[12.5px] text-muted-foreground">
          {new Date(o.ordered_at).toLocaleDateString('ko-KR')}
        </span>
      ),
      align: 'right',
    },
  ];
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const [stats, weekly, recentOrders] = await Promise.all([
    getDashboardStats(),
    getWeeklySalesTrend(),
    getRecentOrders(5),
  ]);

  return (
    <div>
      <PageHeader
        title="대시보드"
        description={`오늘 · ${new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}`}
      />

      <section aria-label="핵심 지표" className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            label="오늘 주문"
            value={stats.todayOrders.toLocaleString()}
            unit="건"
            sub={`어제 ${stats.yesterdayOrders.toLocaleString()}건`}
            icon={ShoppingBag}
            trend={trend(stats.todayOrders, stats.yesterdayOrders)}
          />
          <Kpi
            label="오늘 매출"
            value={formatKRW(stats.todayRevenue)}
            unit="원"
            sub={`어제 ${formatKRW(stats.yesterdayRevenue)}원`}
            icon={Coins}
            trend={trend(stats.todayRevenue, stats.yesterdayRevenue)}
          />
          <Kpi
            label="총 회원"
            value={stats.totalMembers.toLocaleString()}
            unit="명"
            sub={`오늘 신규 ${stats.newMembersToday}명`}
            icon={UsersIcon}
          />
          <Kpi
            label="판매 상품"
            value={stats.activeProducts.toLocaleString()}
            unit="개"
            sub={`전체 ${stats.totalProducts.toLocaleString()}개`}
            icon={Package}
          />
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="통계 차트">
        <WeeklyBarChart data={weekly} />
        <QuickLinks />
      </section>

      <section aria-label="최근 주문">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
            최근 주문
          </h2>
          <Link
            href="/orders"
            className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[var(--mz-accent)] hover:underline"
          >
            전체 보기 <ArrowRight className="h-3 w-3" strokeWidth={2} />
          </Link>
        </div>
        <DataTable<RecentOrder>
          columns={recentOrderColumns()}
          rows={recentOrders}
          rowKey={(o) => o.id}
          empty="아직 주문이 없습니다."
        />
      </section>
    </div>
  );
}
