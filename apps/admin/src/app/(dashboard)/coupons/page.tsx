import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import type { CouponStatus } from '@commerce/types';
import {
  adminListCoupons,
  COUPON_STATUS_LABEL,
  COUPON_STATUS_VARIANT,
} from '@/lib/queries/coupons';
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

export const metadata = { title: '쿠폰 관리' };

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'PAUSED', label: '일시정지' },
  { value: 'EXPIRED', label: '만료' },
  { value: 'DEPLETED', label: '소진' },
] as const;

type CouponRow = Awaited<ReturnType<typeof adminListCoupons>>['data'][number];

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function CouponsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as CouponStatus | 'ALL') ?? 'ALL';
  const search = params.search ?? '';
  const page = Math.max(1, Number(params.page ?? 1));

  const result = await adminListCoupons({ status, search: search || undefined, page });

  function buildQuery(overrides: Record<string, string | undefined>) {
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
    return str ? `/coupons?${str}` : '/coupons';
  }

  const columns: DataTableColumn<CouponRow>[] = [
    {
      key: 'code',
      header: '쿠폰코드',
      width: '160px',
      cell: (c) => (
        <Link
          href={`/coupons/${c.id}`}
          className="font-mono text-[12.5px] font-medium text-foreground hover:text-[var(--mz-accent)] hover:underline"
        >
          {c.code}
        </Link>
      ),
    },
    {
      key: 'name',
      header: '쿠폰명',
      cell: (c) => <span className="text-[13px] text-foreground">{c.name_ko}</span>,
    },
    {
      key: 'type',
      header: '종류',
      width: '70px',
      cell: (c) => (
        <Badge variant="outline">{c.type === 'FIXED_AMOUNT' ? '정액' : '정률'}</Badge>
      ),
    },
    {
      key: 'discount',
      header: '할인',
      align: 'right',
      width: '120px',
      cell: (c) => (
        <span className="font-mono text-[13px] font-medium">
          {c.type === 'PERCENTAGE'
            ? `${c.discount_value}%`
            : `${c.discount_value.toLocaleString()} ${c.currency ?? ''}`}
        </span>
      ),
    },
    {
      key: 'usage',
      header: '발급 / 사용',
      align: 'center',
      width: '160px',
      cell: (c) => (
        <span className="text-[12.5px] text-muted-foreground">
          <span className="font-mono text-foreground">{c.issuance_count.toLocaleString()}</span>
          {' / '}
          <span className="font-mono">{c.used_count.toLocaleString()}</span>
          {c.max_issuance_count !== null && (
            <span className="ml-1 text-[11px]">
              (한도 {c.max_issuance_count.toLocaleString()})
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'validity',
      header: '유효기간',
      width: '140px',
      cell: (c) => (
        <div className="text-[11.5px] text-muted-foreground">
          <div>{new Date(c.starts_at).toLocaleDateString('ko-KR')}</div>
          <div>~ {new Date(c.expires_at).toLocaleDateString('ko-KR')}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: '상태',
      width: '90px',
      cell: (c) => (
        <Badge variant={COUPON_STATUS_VARIANT[c.status]}>{COUPON_STATUS_LABEL[c.status]}</Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="쿠폰 관리"
        description={`총 ${result.total.toLocaleString()}건`}
        actions={
          <Button size="sm" asChild>
            <Link href="/coupons/new">
              <Plus className="mr-1.5 h-4 w-4" />
              쿠폰 생성
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterPills
          pills={STATUS_TABS}
          activeValue={status}
          buildHref={(v) => buildQuery({ status: v, page: '1' })}
        />
        <form method="GET" action="/coupons" className="ml-auto flex gap-2">
          <input type="hidden" name="status" value={status} />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="코드 / 쿠폰명 검색"
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

      <DataTable<CouponRow>
        columns={columns}
        rows={result.data}
        rowKey={(c) => c.id}
        empty="조건에 맞는 쿠폰이 없습니다. 새 쿠폰을 생성해보세요."
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
