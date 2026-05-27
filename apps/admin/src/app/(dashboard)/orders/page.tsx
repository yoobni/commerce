import Link from 'next/link';
import { Search } from 'lucide-react';
import type { OrderStatus } from '@commerce/types';
import { adminListOrders, ORDER_STATUS_LABEL } from '@/lib/queries/orders';
import {
  Badge,
  type BadgeProps,
  Button,
  Card,
  DataTable,
  type DataTableColumn,
  Input,
  PageHeader,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui';
import { cn } from '@/lib/cn';

export const metadata = { title: '주문 관리' };

/* ─── status filter ───────────────────────────────────────────────────────── */

const STATUS_TABS: Array<{ value: OrderStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING_PAYMENT', label: '결제대기' },
  { value: 'PAID', label: '결제완료' },
  { value: 'PREPARING', label: '준비중' },
  { value: 'SHIPPED', label: '배송중' },
  { value: 'DELIVERED', label: '배송완료' },
  { value: 'CONFIRMED', label: '구매확정' },
  { value: 'RETURN_REQUESTED', label: '반품요청' },
  { value: 'CANCELLED', label: '취소' },
];

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

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

/* ─── pagination helper ───────────────────────────────────────────────────── */

function pageItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: Array<number | 'ellipsis'> = [];
  items.push(1);
  if (current > 4) items.push('ellipsis');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    items.push(p);
  }
  if (current < total - 3) items.push('ellipsis');
  items.push(total);
  return items;
}

/* ─── page ────────────────────────────────────────────────────────────────── */

type AdminOrder = Awaited<ReturnType<typeof adminListOrders>>['data'][number];

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as OrderStatus | 'ALL') ?? 'ALL';
  const search = params.search ?? '';
  const page = Math.max(1, Number(params.page ?? 1));

  const result = await adminListOrders({ status, search: search || undefined, page });
  const totalPages = Math.max(1, Math.ceil(result.total / result.per_page));

  function buildQuery(overrides: Record<string, string | undefined>): string {
    const q = new URLSearchParams();
    const merged = {
      status,
      search: search || undefined,
      page: String(page),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'ALL') q.set(k, v);
    });
    const str = q.toString();
    return str ? `/orders?${str}` : '/orders';
  }

  const columns: DataTableColumn<AdminOrder>[] = [
    {
      key: 'order',
      header: '주문번호',
      width: '180px',
      cell: (o) => (
        <Link
          href={`/orders/${o.id}`}
          className="font-mono text-[12.5px] font-medium text-foreground hover:text-[var(--mz-accent)] hover:underline"
        >
          {o.order_number}
        </Link>
      ),
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
      header: '결제금액',
      align: 'right',
      cell: (o) => (
        <span className="font-mono text-[13px] font-medium">
          {formatAmount(o.total_amount, o.currency)}
        </span>
      ),
    },
    {
      key: 'status',
      header: '상태',
      width: '110px',
      cell: (o) => (
        <Badge variant={STATUS_VARIANT[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
      ),
    },
    {
      key: 'date',
      header: '주문일',
      align: 'right',
      width: '120px',
      cell: (o) => (
        <span className="text-[12.5px] text-muted-foreground">
          {new Date(o.ordered_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="주문 관리"
        description={`총 ${result.total.toLocaleString()}건`}
      />

      {/* Status filter — URL-driven pills (no client state) */}
      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_TABS.map((tab) => {
            const active = tab.value === status;
            return (
              <Link
                key={tab.value}
                href={buildQuery({ status: tab.value, page: '1' })}
                className={cn(
                  'rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors',
                  active
                    ? 'bg-[var(--mz-ink)] text-white'
                    : 'bg-muted text-foreground hover:bg-secondary',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Search */}
      <form method="GET" action="/orders" className="mb-4 flex gap-2">
        <input type="hidden" name="status" value={status} />
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="search" defaultValue={search} placeholder="주문번호 검색" className="pl-9" />
        </div>
        <Button type="submit" variant="outline">
          검색
        </Button>
        {search && (
          <Button type="button" variant="ghost" asChild>
            <Link href={buildQuery({ search: undefined, page: '1' })}>초기화</Link>
          </Button>
        )}
      </form>

      <DataTable<AdminOrder>
        columns={columns}
        rows={result.data}
        rowKey={(o) => o.id}
        empty="조건에 맞는 주문이 없습니다."
        footer={
          totalPages > 1 && (
            <>
              <span className="text-[12.5px] text-muted-foreground">
                {result.data.length}건 표시 · 총 {result.total.toLocaleString()}건
              </span>
              <Pagination className="m-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    {page > 1 ? (
                      <PaginationPrevious href={buildQuery({ page: String(page - 1) })} />
                    ) : (
                      <span className="pointer-events-none opacity-40">
                        <PaginationPrevious href="#" />
                      </span>
                    )}
                  </PaginationItem>
                  {pageItems(page, totalPages).map((it, i) =>
                    it === 'ellipsis' ? (
                      <PaginationItem key={`e-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={it}>
                        <PaginationLink
                          href={buildQuery({ page: String(it) })}
                          isActive={it === page}
                        >
                          {it}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    {page < totalPages ? (
                      <PaginationNext href={buildQuery({ page: String(page + 1) })} />
                    ) : (
                      <span className="pointer-events-none opacity-40">
                        <PaginationNext href="#" />
                      </span>
                    )}
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )
        }
      />
    </div>
  );
}
