import Link from 'next/link';
import type { UserStatus } from '@commerce/types';
import {
  adminListMembers,
  USER_STATUS_LABEL,
  USER_STATUS_BADGE,
  type MemberStatusFilter,
} from '@/lib/queries/members';

export const metadata = { title: '회원 관리' };

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

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">회원 관리</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/members?status=${tab.value}${search ? `&search=${search}` : ''}`}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                status === tab.value
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form method="GET" className="flex gap-2 ml-auto">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="이름·이메일 검색"
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input type="hidden" name="status" value={status} />
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90"
          >
            검색
          </button>
          {search && (
            <Link
              href={`/members?status=${status}`}
              className="px-4 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-gray-50 text-[var(--color-text-secondary)]"
            >
              초기화
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
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
              result.data.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/members/${member.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {member.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{member.email}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{member.country}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {LOCALE_LABEL[member.locale] ?? member.locale}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        USER_STATUS_BADGE[member.status as UserStatus] ?? 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {USER_STATUS_LABEL[member.status as UserStatus] ?? member.status}
                    </span>
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

      {/* Pagination */}
      {result.total > result.per_page && (
        <div className="flex items-center justify-between mt-4 text-sm text-[var(--color-text-secondary)]">
          <span>총 {result.total.toLocaleString()}명 · {page}페이지</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/members?status=${status}&search=${search}&page=${page - 1}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                이전
              </Link>
            )}
            {result.has_next && (
              <Link
                href={`/members?status=${status}&search=${search}&page=${page + 1}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                다음
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
