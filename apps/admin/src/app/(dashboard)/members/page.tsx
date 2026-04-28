import Link from 'next/link';
import type { UserStatus } from '@commerce/types';
import {
  adminListMembers,
  MEMBER_STATUS_LABEL,
  MEMBER_STATUS_BADGE,
  AUTH_PROVIDER_LABEL,
  AUTH_PROVIDER_BADGE,
} from '@/lib/queries/members';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { StatusTabs } from '@/components/ui/StatusTabs';

export const metadata = { title: '회원 관리' };

// ─── Status tabs ──────────────────────────────────────────────────────────────

const STATUS_TABS: Array<{ value: UserStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'SUSPENDED', label: '정지' },
  { value: 'WITHDRAWN', label: '탈퇴' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

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
      if (v !== undefined) q.set(k, v);
    });
    const str = q.toString();
    return str ? `/members?${str}` : '/members';
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">회원 관리</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <StatusTabs
          tabs={STATUS_TABS}
          activeValue={status}
          buildUrl={(v) => buildQuery({ status: v, page: '1' })}
        />

        <form method="GET" action="/members" className="flex gap-2 ml-auto">
          <input type="hidden" name="status" value={status} />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="이름 / 이메일 검색"
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            검색
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                회원
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                가입경로
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                국가
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                상태
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                마지막 로그인
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                가입일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {result.data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center text-[var(--color-text-tertiary)]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-10 h-10 text-[var(--color-border)]"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>회원이 없습니다.</span>
                  </div>
                </td>
              </tr>
            ) : (
              result.data.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/members/${member.id}`} className="flex flex-col group">
                      <span className="font-medium text-[var(--color-text-primary)] group-hover:text-blue-600 transition-colors">
                        {member.name}
                      </span>
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        {member.email}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={AUTH_PROVIDER_BADGE[member.provider]}>
                      {AUTH_PROVIDER_LABEL[member.provider]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{member.country}</td>
                  <td className="px-4 py-3">
                    <Badge className={MEMBER_STATUS_BADGE[member.status]}>
                      {MEMBER_STATUS_LABEL[member.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {member.last_login_at ? (
                      new Date(member.last_login_at).toLocaleDateString('ko-KR')
                    ) : (
                      <span className="text-[var(--color-text-tertiary)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {new Date(member.created_at).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={result.total}
        perPage={result.per_page}
        buildUrl={(p) => buildQuery({ page: String(p) })}
      />
    </div>
  );
}
