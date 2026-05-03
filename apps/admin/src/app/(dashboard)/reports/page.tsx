import Link from 'next/link';
import type { ReportStatus, ReportTargetType } from '@commerce/types';
import {
  adminListReports,
  REPORT_STATUS_LABEL,
  REPORT_STATUS_BADGE,
  REPORT_TARGET_LABEL,
  REPORT_REASON_LABEL,
} from '@/lib/queries/reports';

export const metadata = { title: '신고 관리' };

const STATUS_TABS: Array<{ value: ReportStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '대기' },
  { value: 'REVIEWED', label: '검토 중' },
  { value: 'RESOLVED', label: '처리 완료' },
  { value: 'DISMISSED', label: '기각' },
];

const TARGET_TABS: Array<{ value: ReportTargetType | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'POST', label: '게시글' },
  { value: 'COMMENT', label: '댓글' },
  { value: 'REVIEW', label: '리뷰' },
  { value: 'USER', label: '회원' },
];

interface PageProps {
  searchParams: Promise<{ status?: string; target?: string; page?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as ReportStatus | 'ALL') ?? 'ALL';
  const targetType = (params.target as ReportTargetType | 'ALL') ?? 'ALL';
  const page = Math.max(1, Number(params.page ?? 1));

  const result = await adminListReports({ status, targetType, page });

  function buildQuery(overrides: Record<string, string | undefined>): string {
    const q = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      status,
      target: targetType,
      page: String(page),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined) q.set(k, v);
    });
    const str = q.toString();
    return str ? `/reports?${str}` : '/reports';
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">신고 관리</h1>
        <span className="text-sm text-[var(--color-text-tertiary)]">
          총 {result.total.toLocaleString()}건
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildQuery({ status: tab.value, page: '1' })}
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

        {/* Target type tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {TARGET_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildQuery({ target: tab.value, page: '1' })}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                targetType === tab.value
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                신고 유형
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                신고 사유
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                신고자
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                상태
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                신고일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {result.data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
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
                        d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5"
                      />
                    </svg>
                    <span>신고 내역이 없습니다.</span>
                  </div>
                </td>
              </tr>
            ) : (
              result.data.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {REPORT_TARGET_LABEL[report.target_type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/reports/${report.id}`}
                      className="text-[var(--color-text-primary)] hover:text-blue-600 transition-colors"
                    >
                      {REPORT_REASON_LABEL[report.reason]}
                      {report.detail && (
                        <span className="ml-1 text-[var(--color-text-tertiary)] text-xs truncate max-w-[140px] inline-block align-middle">
                          — {report.detail}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {report.reporter?.name ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${REPORT_STATUS_BADGE[report.status]}`}
                    >
                      {REPORT_STATUS_LABEL[report.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {new Date(report.created_at).toLocaleDateString('ko-KR')}
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
            총 {result.total.toLocaleString()}건 · {page}페이지
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildQuery({ page: String(page - 1) })}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                이전
              </Link>
            )}
            {result.has_next && (
              <Link
                href={buildQuery({ page: String(page + 1) })}
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
