import Link from 'next/link';
import { Search } from 'lucide-react';
import type { UserStatus } from '@commerce/types';
import {
  adminListMembers,
  MEMBER_STATUS_LABEL,
  MEMBER_STATUS_VARIANT,
  AUTH_PROVIDER_LABEL,
  AUTH_PROVIDER_VARIANT,
} from '@/lib/queries/members';
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

export const metadata = { title: '회원 관리' };

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'SUSPENDED', label: '정지' },
  { value: 'WITHDRAWN', label: '탈퇴' },
] as const;

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
        <Badge variant={AUTH_PROVIDER_VARIANT[m.provider]}>
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

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterPills
          pills={STATUS_TABS}
          activeValue={status}
          buildHref={(v) => buildQuery({ status: v, page: '1' })}
        />
        <form method="GET" action="/members" className="ml-auto flex gap-2">
          <input type="hidden" name="status" value={status} />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="이름 / 이메일 검색"
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

      <DataTable<AdminMember>
        columns={columns}
        rows={result.data}
        rowKey={(m) => m.id}
        empty="조건에 맞는 회원이 없습니다."
        footer={
          <DataTablePagination
            page={page}
            total={result.total}
            perPage={result.per_page}
            displayed={result.data.length}
            unit="명"
            buildHref={(p) => buildQuery({ page: String(p) })}
          />
        }
      />
    </div>
  );
}
