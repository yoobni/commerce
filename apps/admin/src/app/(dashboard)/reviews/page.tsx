import Link from 'next/link';
import type { ReviewStatus } from '@commerce/types';
import { adminListReviews } from '@/lib/queries/reviews';

// ─── Labels & badges ──────────────────────────────────────────────────────────

const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  ACTIVE: '노출',
  HIDDEN: '숨김',
  DELETED: '삭제',
};

const REVIEW_STATUS_BADGE: Record<ReviewStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  HIDDEN: 'bg-orange-100 text-orange-700',
  DELETED: 'bg-red-100 text-red-700',
};

const STATUS_TABS: Array<{ value: ReviewStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '노출' },
  { value: 'HIDDEN', label: '숨김' },
  { value: 'DELETED', label: '삭제' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    status?: string;
    best?: string;
    photo?: string;
    rating?: string;
    page?: string;
  }>;
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as ReviewStatus | 'ALL') ?? 'ALL';
  const isBest = params.best === '1' ? true : params.best === '0' ? false : undefined;
  const isPhoto = params.photo === '1' ? true : params.photo === '0' ? false : undefined;
  const minRating = params.rating ? Number(params.rating) : undefined;
  const page = Number(params.page ?? 1);

  const result = await adminListReviews({
    status,
    isBest,
    isPhoto,
    minRating,
    page,
  });

  function buildQuery(overrides: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    const merged = {
      status,
      best: params.best,
      photo: params.photo,
      rating: params.rating,
      page: String(page),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined) q.set(k, v);
    });
    return '?' + q.toString();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">리뷰 관리</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/reviews${buildQuery({ status: tab.value, page: '1' })}`}
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

        {/* Quick filters */}
        <div className="flex gap-2 flex-wrap">
          <Link
            href={`/reviews${buildQuery({ best: isBest === true ? undefined : '1', page: '1' })}`}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              isBest === true
                ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50'
            }`}
          >
            베스트
          </Link>
          <Link
            href={`/reviews${buildQuery({ photo: isPhoto === true ? undefined : '1', page: '1' })}`}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              isPhoto === true
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50'
            }`}
          >
            포토리뷰
          </Link>
          <Link
            href={`/reviews${buildQuery({ rating: minRating === 1 ? undefined : '1', page: '1' })}`}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              minRating === 1
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50'
            }`}
          >
            1점
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                상품
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                작성자
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                평점
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                내용 요약
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                상태
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                작성일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {result.data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-[var(--color-text-tertiary)]"
                >
                  리뷰가 없습니다.
                </td>
              </tr>
            ) : (
              result.data.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {review.product ? (
                      <div className="flex items-center gap-2">
                        {review.product.thumbnail_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={review.product.thumbnail_url}
                            alt={review.product.name_ko}
                            className="w-8 h-8 object-cover rounded border border-[var(--color-border)]"
                          />
                        )}
                        <span className="text-[var(--color-text-primary)] truncate max-w-[140px]">
                          {review.product.name_ko}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-primary)]">
                    {review.user?.name ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-semibold ${
                        review.rating <= 2
                          ? 'text-red-600'
                          : review.rating === 3
                          ? 'text-orange-500'
                          : 'text-yellow-500'
                      }`}
                    >
                      {'★'.repeat(review.rating)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-[200px]">
                    <Link
                      href={`/reviews/${review.id}`}
                      className="hover:text-[var(--color-text-primary)] line-clamp-2"
                    >
                      {review.content}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${REVIEW_STATUS_BADGE[review.status]}`}
                      >
                        {REVIEW_STATUS_LABEL[review.status]}
                      </span>
                      {review.is_best && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 w-fit">
                          베스트
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {new Date(review.created_at).toLocaleDateString('ko-KR')}
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
                href={`/reviews${buildQuery({ page: String(page - 1) })}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                이전
              </Link>
            )}
            {result.has_next && (
              <Link
                href={`/reviews${buildQuery({ page: String(page + 1) })}`}
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
