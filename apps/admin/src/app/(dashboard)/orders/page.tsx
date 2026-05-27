import Link from 'next/link';
import { Search } from 'lucide-react';
import type { OrderStatus } from '@commerce/types';
import {
  adminListOrders,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VARIANT,
} from '@/lib/queries/orders';
import {
  Badge,
  Button,
  DataTable,
  type DataTableColumn,
  DataTablePagination,
  FilterPills,
  Input,
  PageHeader,
} from '@/components/ui';

export const metadata = { title: '주문 관리' };

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING_PAYMENT', label: '결제대기' },
  { value: 'PAID', label: '결제완료' },
  { value: 'PREPARING', label: '준비중' },
  { value: 'SHIPPED', label: '배송중' },
  { value: 'DELIVERED', label: '배송완료' },
  { value: 'CONFIRMED', label: '구매확정' },
  { value: 'RETURN_REQUESTED', label: '반품요청' },
  { value: 'CANCELLED', label: '취소' },
] as const;

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
        <Badge variant={ORDER_STATUS_VARIANT[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
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
      <PageHeader title="주문 관리" description={`총 ${result.total.toLocaleString()}건`} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterPills
          pills={STATUS_TABS}
          activeValue={status}
          buildHref={(v) => buildQuery({ status: v, page: '1' })}
        />
        <form method="GET" action="/orders" className="ml-auto flex gap-2">
          <input type="hidden" name="status" value={status} />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="주문번호 검색"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline" size="md">
            검색
          </Button>
          {search && (
            <Button type="button" variant="ghost" size="md" asChild>
              <Link href={buildQuery({ search: undefined, page: '1' })}>초기화</Link>
            </Button>
          )}
        </form>
      </div>

      <DataTable<AdminOrder>
        columns={columns}
        rows={result.data}
        rowKey={(o) => o.id}
        empty="조건에 맞는 주문이 없습니다."
        footer={
          <DataTablePagination
            page={page}
            total={result.total}
            perPage={result.per_page}
            displayed={result.data.length}
            unit="건"
            buildHref={(p) => buildQuery({ page: String(p) })}
          />
        }
      />
    </div>
  );
}
