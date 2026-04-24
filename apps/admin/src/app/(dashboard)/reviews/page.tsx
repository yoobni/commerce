import Link from 'next/link';
import type { ReviewStatus } from '@commerce/types';
import { adminListReviews } from '@/lib/queries/reviews';
import {
  PageHeader,
  StatusTabs,
  SectionCard,
  Pagination,
  Badge,
} from '@/components/ui';

// ─── Labels & badge variants ───────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'accent';

const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  ACTIVE: '노출',
  HIDDEN: '숨김',
  DELETED: '삭제',
};

const REVIEW_STATUS_VARIANT: Record<ReviewStatus, BadgeVariant> = {
  ACTIVE: 'success',
  HIDDEN: 'warning',
  DELETED: 'danger',
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
    const merged: Record<string, string | undefined> = {
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
      <PageHeader title="리뷰 관리" />

      {/* Filters row */}
      <div className="flex flex-wrap items-start gap-3 mb-6">
        <StatusTabs
          tabs={STATUS_TABS}
          current={status}
          buildHref={(value) => `/reviews${buildQuery({ status: value, page: '1' })}`}
        />

        {/* Quick filters */}
        <div className="flex gap-2 flex-wrap">
          <Link
            href={`/reviews${buildQuery({ best: isBest === true ? undefined : '1', page: '1' })}`}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              isBest === true
                ? 'border-[var(--color-warning)] bg-[var(--color-warning-surface)] text-[var(--color-warning)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            베스트
          </Link>
          <Link
            href={`/reviews${buildQuery({ photo: isPhoto === true ? undefined : '1', page: '1' })}`}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              isPhoto === true
                ? 'border-[var(--color-info)] bg-[var(--color-info-surface)] text-[var(--color-info)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            포토리뷰
          </Link>
          <Link
            href={`/reviews${buildQuery({ rating: minRating === 1 ? undefined : '1', page: '1' })}`}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              minRating === 1
                ? 'border-[var(--color-error)] bg-[var(--color-error-surface)] text-[var(--color-error)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            1점
          </Link>
        </div>
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상품</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">작성자</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">평점</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">내용 요약</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">작성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {result.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                    리뷰가 없습니다.
                  </td>
                </tr>
              ) : (
                result.data.map((review) => (
                  <tr key={review.id} className="hover:bg-[var(--color-surface-muted)] transition-colors">
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
                        className={`font-semibold text-sm ${
                          review.rating <= 2
                            ? 'text-[var(--color-error)]'
                            : review.rating === 3
                            ? 'text-[var(--color-warning)]'
                            : 'text-[var(--color-brand-accent)]'
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
                        <Badge variant={REVIEW_STATUS_VARIANT[review.status]}>
                          {REVIEW_STATUS_LABEL[review.status]}
                        </Badge>
                        {review.is_best && (
                          <Badge variant="accent">베스트</Badge>
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
      </SectionCard>

      <Pagination
        page={page}
        total={result.total}
        perPage={result.per_page}
        hasNext={result.has_next}
        buildHref={(p) => `/reviews${buildQuery({ page: String(p) })}`}
      />
    </div>
  );
}
