import Link from 'next/link';
import type { UserStatus } from '@commerce/types';
import {
  adminListMembers,
  USER_STATUS_LABEL,
  type MemberStatusFilter,
} from '@/lib/queries/members';
import {
  PageHeader,
  StatusTabs,
  SearchBar,
  SectionCard,
  Pagination,
  Badge,
} from '@/components/ui';

export const metadata = { title: '회원 관리' };

// ─── Badge variant map ─────────────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'accent';

const USER_STATUS_VARIANT: Partial<Record<UserStatus, BadgeVariant>> = {
  ACTIVE: 'success',
  SUSPENDED: 'danger',
  WITHDRAWN: 'neutral',
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const STATUS_TABS: Array<{ value: MemberStatusFilter; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '정상' },
  { value: 'SUSPENDED', label: '정지' },
  { value: 'WITHDRAWN', label: '탈퇴' },
];

const LOCALE_LABEL: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  de: 'Deutsch',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function MembersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as MemberStatusFilter) ?? 'ALL';
  const search = params.search ?? '';
  const page = Number(params.page ?? 1);

  const result = await adminListMembers({ status, search: search || undefined, page });

  function buildTabHref(value: MemberStatusFilter) {
    const q = new URLSearchParams({ status: value });
    if (search) q.set('search', search);
    return `/members?${q.toString()}`;
  }

  function buildPageHref(p: number) {
    const q = new URLSearchParams({ status, page: String(p) });
    if (search) q.set('search', search);
    return `/members?${q.toString()}`;
  }

  return (
    <div>
      <PageHeader title="회원 관리" />

      {/* Filters row */}
      <div className="flex flex-wrap items-start gap-3 mb-6">
        <StatusTabs
          tabs={STATUS_TABS}
          current={status}
          buildHref={buildTabHref}
        />
        <SearchBar
          defaultValue={search}
          placeholder="이름·이메일 검색"
          hiddenFields={[{ name: 'status', value: status }]}
          resetHref={`/members?status=${status}`}
        />
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">이름</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">이메일</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">국가</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">언어</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">가입일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {result.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                    회원이 없습니다.
                  </td>
                </tr>
              ) : (
                result.data.map((member) => {
                  const memberStatus = member.status as UserStatus;
                  return (
                    <tr key={member.id} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/members/${member.id}`}
                          className="font-medium text-[var(--color-link)] hover:underline"
                        >
                          {member.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {member.email}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {member.country}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {LOCALE_LABEL[member.locale] ?? member.locale}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={USER_STATUS_VARIANT[memberStatus] ?? 'neutral'}>
                          {USER_STATUS_LABEL[memberStatus] ?? member.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {new Date(member.created_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Pagination
        page={page}
        total={result.total}
        perPage={result.per_page}
        hasNext={result.has_next}
        buildHref={buildPageHref}
      />
    </div>
  );
}
