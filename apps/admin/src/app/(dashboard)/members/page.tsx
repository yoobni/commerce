import Link from 'next/link';
import { Search } from 'lucide-react';
import type { UserStatus } from '@commerce/types';
import {
  adminListMembers,
  MEMBER_STATUS_LABEL,
  AUTH_PROVIDER_LABEL,
} from '@/lib/queries/members';
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

export const metadata = { title: '회원 관리' };

const STATUS_TABS: Array<{ value: UserStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'SUSPENDED', label: '정지' },
  { value: 'WITHDRAWN', label: '탈퇴' },
];

const MEMBER_STATUS_VARIANT: Record<UserStatus, BadgeProps['variant']> = {
  ACTIVE: 'success',
  SUSPENDED: 'destructive',
  WITHDRAWN: 'muted',
};

const PROVIDER_VARIANT: Partial<Record<string, BadgeProps['variant']>> = {
  EMAIL: 'outline',
  GOOGLE: 'secondary',
  APPLE: 'secondary',
  KAKAO: 'warning',
  NAVER: 'success',
};

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

type AdminMember = Awaited<ReturnType<typeof adminListMembers>>['data'][number];

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

export default async function MembersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as UserStatus | 'ALL') ?? 'ALL';
  const search = params.search ?? '';
  const page = Math.max(1, Number(params.page ?? 1));

  const result = await adminListMembers({ status, search: search || undefined, page });
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
    return str ? `/members?${str}` : '/members';
  }

  const columns: DataTableColumn<AdminMember>[] = [
    {
      key: 'member',
      header: '회원',
      cell: (m) => (
        <Link href={`/members/${m.id}`} className="group flex flex-col">
          <span className="text-[13px] font-medium text-foreground group-hover:text-[var(--mz-accent)] group-hover:underline">
            {m.name}
          </span>
          <span className="text-[11px] text-muted-foreground">{m.email}</span>
        </Link>
      ),
    },
    {
      key: 'provider',
      header: '가입경로',
      width: '110px',
      cell: (m) => (
        <Badge variant={PROVIDER_VARIANT[m.provider] ?? 'outline'}>
          {AUTH_PROVIDER_LABEL[m.provider]}
        </Badge>
      ),
    },
    {
      key: 'country',
      header: '국가',
      width: '80px',
      cell: (m) => <span className="text-[12.5px] text-muted-foreground">{m.country}</span>,
    },
    {
      key: 'status',
      header: '상태',
      width: '90px',
      cell: (m) => (
        <Badge variant={MEMBER_STATUS_VARIANT[m.status]}>{MEMBER_STATUS_LABEL[m.status]}</Badge>
      ),
    },
    {
      key: 'last_login',
      header: '마지막 로그인',
      width: '130px',
      cell: (m) =>
        m.last_login_at ? (
          <span className="text-[12.5px] text-muted-foreground">
            {new Date(m.last_login_at).toLocaleDateString('ko-KR')}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'created',
      header: '가입일',
      width: '120px',
      align: 'right',
      cell: (m) => (
        <span className="text-[12.5px] text-muted-foreground">
          {new Date(m.created_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="회원 관리" description={`총 ${result.total.toLocaleString()}명`} />

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

      <form method="GET" action="/members" className="mb-4 flex gap-2">
        <input type="hidden" name="status" value={status} />
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search}
            placeholder="이름 / 이메일 검색"
            className="pl-9"
          />
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

      <DataTable<AdminMember>
        columns={columns}
        rows={result.data}
        rowKey={(m) => m.id}
        empty="조건에 맞는 회원이 없습니다."
        footer={
          totalPages > 1 && (
            <>
              <span className="text-[12.5px] text-muted-foreground">
                {result.data.length}명 표시 · 총 {result.total.toLocaleString()}명
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
