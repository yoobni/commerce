import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReviewStatus, SizeFeedback } from '@commerce/types';
import { adminGetReview } from '@/lib/queries/reviews';
import { ReviewActionButtons } from './_components/ReviewActionButtons';

// ─── Labels ───────────────────────────────────────────────────────────────────

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

const SIZE_FEEDBACK_LABEL: Record<SizeFeedback, string> = {
  SMALL: '작음',
  PERFECT: '적합',
  LARGE: '큼',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { id } = await params;
  const review = await adminGetReview(id);
  if (!review) notFound();

  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);

  return (
    <div className="max-w-4xl">
      <Link
        href="/reviews"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        ← 리뷰 목록
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">리뷰 상세</h1>
        <span
          className={`px-2.5 py-1 rounded-full text-sm font-medium ${REVIEW_STATUS_BADGE[review.status]}`}
        >
          {REVIEW_STATUS_LABEL[review.status]}
        </span>
        {review.is_best && (
          <span className="px-2.5 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
            베스트
          </span>
        )}
        {review.is_photo_review && (
          <span className="px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            포토리뷰
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Main ── */}
        <div className="col-span-2 space-y-6">
          {/* Review content */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              {/* Stars */}
              <div className="flex gap-0.5">
                {stars.map((filled, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-lg font-semibold text-[var(--color-text-primary)]">
                {review.rating}점
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
              {review.content}
            </p>

            {/* Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {review.images.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`리뷰 이미지 ${i + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-[var(--color-border)]"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Dog info */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="font-medium text-[var(--color-text-primary)] mb-4">반려견 정보</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">구매 사이즈</dt>
                <dd className="font-medium text-[var(--color-text-primary)]">
                  {review.purchased_size}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">사이즈 평가</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {SIZE_FEEDBACK_LABEL[review.size_feedback]}
                </dd>
              </div>
              {review.dog_breed && (
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">견종</dt>
                  <dd className="text-[var(--color-text-primary)]">{review.dog_breed}</dd>
                </div>
              )}
              {review.dog_weight_kg != null && (
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">체중</dt>
                  <dd className="text-[var(--color-text-primary)]">{review.dog_weight_kg}kg</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Product */}
          {review.product && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="font-medium text-[var(--color-text-primary)] mb-4">상품</h2>
              <div className="flex items-center gap-3">
                {review.product.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.product.thumbnail_url}
                    alt={review.product.name_ko}
                    className="w-14 h-14 object-cover rounded-lg border border-[var(--color-border)]"
                  />
                )}
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {review.product.name_ko}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] font-mono mt-0.5">
                    {review.product.id}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="col-span-1 space-y-4">
          {/* Actions */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="font-medium text-[var(--color-text-primary)] mb-4">관리 액션</h2>
            <ReviewActionButtons
              reviewId={review.id}
              currentStatus={review.status}
              isBest={review.is_best}
              pointRewarded={review.point_rewarded}
            />
          </div>

          {/* Author */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="font-medium text-[var(--color-text-primary)] mb-3">작성자</h2>
            <div className="flex items-center gap-3">
              {review.user?.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={review.user.profile_image_url}
                  alt={review.user.name}
                  className="w-9 h-9 rounded-full object-cover border border-[var(--color-border)]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-500">
                  {review.user?.name?.[0] ?? '?'}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {review.user?.name ?? '-'}
                </p>
                <Link
                  href={`/members/${review.user_id}`}
                  className="text-xs text-blue-500 hover:underline"
                >
                  회원 상세 →
                </Link>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="font-medium text-[var(--color-text-primary)] mb-3">타임스탬프</h2>
            <dl className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              <div className="flex justify-between">
                <dt>작성</dt>
                <dd>{new Date(review.created_at).toLocaleString('ko-KR')}</dd>
              </div>
              <div className="flex justify-between">
                <dt>수정</dt>
                <dd>{new Date(review.updated_at).toLocaleString('ko-KR')}</dd>
              </div>
              <div className="flex justify-between">
                <dt>포인트</dt>
                <dd>{review.point_rewarded ? '지급 완료' : '미지급'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
