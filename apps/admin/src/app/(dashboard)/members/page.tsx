import Link from 'next/link';
import type { UserStatus } from '@commerce/types';
import { adminListMembers } from '@/lib/queries/members';

const STATUS_LABELS: Record<UserStatus | 'ALL', string> = {
  ALL: '전체',
  ACTIVE: '활성',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

const STATUS_BADGE: Record<UserStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
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
  const status = (params.status as UserStatus | 'ALL') ?? 'ALL';
  const search = params.search ?? '';
  const page = Number(params.page ?? 1);

  const result = await adminListMembers({ status, search: search || undefined, page });

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">회원 관리</h1>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {(['ALL', 'ACTIVE', 'SUSPENDED', 'WITHDRAWN'] as const).map((s) => (
            <Link
              key={s}
              href={`/members?status=${s}${search ? `&search=${search}` : ''}`}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                status === s
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-2 ml-auto">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="이름, 이메일, 전화번호 검색"
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input type="hidden" name="status" value={status} />
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90"
          >
            검색
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">이름</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">이메일</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">전화번호</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">국가</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">가입방식</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">가입일</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">마지막 로그인</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
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
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{member.phone ?? '-'}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{member.country}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)] capitalize">{member.provider}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[member.status]}`}>
                      {STATUS_LABELS[member.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {new Date(member.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {member.last_login_at
                      ? new Date(member.last_login_at).toLocaleDateString('ko-KR')
                      : '-'}
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
          <span>
            총 {result.total.toLocaleString()}명 · {page}페이지
          </span>
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
