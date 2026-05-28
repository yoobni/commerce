import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  adminGetReview,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_VARIANT,
  SIZE_FEEDBACK_LABEL,
} from '@/lib/queries/reviews';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  InfoRow,
  InfoSection,
  PageHeader,
} from '@/components/ui';
import { ReviewActionButtons } from './_components/ReviewActionButtons';

export const metadata = { title: '리뷰 상세' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { id } = await params;
  const review = await adminGetReview(id);
  if (!review) notFound();

  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/reviews">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> 리뷰 목록
          </Link>
        </Button>
      </div>

      <PageHeader
        title="리뷰 상세"
        description={review.product?.name_ko}
        actions={
          <>
            <Badge variant={REVIEW_STATUS_VARIANT[review.status]}>
              {REVIEW_STATUS_LABEL[review.status]}
            </Badge>
            {review.is_best && <Badge variant="warning">베스트</Badge>}
            {review.is_photo_review && <Badge variant="info">포토리뷰</Badge>}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          <InfoSection title="리뷰 내용">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex gap-0.5">
                {stars.map((filled, i) => (
                  <svg
                    key={i}
                    className={filled ? 'h-5 w-5 text-[#e8a93b]' : 'h-5 w-5 text-muted'}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[15px] font-semibold text-foreground">{review.rating}점</span>
            </div>
            <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground">
              {review.content}
            </p>

            {review.images && review.images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {review.images.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`리뷰 이미지 ${i + 1}`}
                    className="h-24 w-24 rounded-md border border-border object-cover"
                  />
                ))}
              </div>
            )}
          </InfoSection>

          <InfoSection title="반려견 정보">
            <dl className="grid grid-cols-2 gap-x-4">
              <InfoRow label="구매 사이즈">
                <span className="font-mono">{review.purchased_size}</span>
              </InfoRow>
              <InfoRow label="사이즈 평가">
                <Badge variant="outline">{SIZE_FEEDBACK_LABEL[review.size_feedback]}</Badge>
              </InfoRow>
              {review.dog_breed && <InfoRow label="견종">{review.dog_breed}</InfoRow>}
              {review.dog_weight_kg != null && (
                <InfoRow label="체중">
                  <span className="font-mono">{review.dog_weight_kg}kg</span>
                </InfoRow>
              )}
            </dl>
          </InfoSection>

          {review.product && (
            <InfoSection title="상품">
              <Link
                href={`/products/${review.product.id}`}
                className="group flex items-center gap-3"
              >
                {review.product.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.product.thumbnail_url}
                    alt={review.product.name_ko}
                    className="h-14 w-14 shrink-0 rounded-md border border-border object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-md border border-border bg-muted" />
                )}
                <div>
                  <p className="text-[14px] font-medium text-foreground group-hover:text-[var(--mz-accent)] group-hover:underline">
                    {review.product.name_ko}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {review.product.id}
                  </p>
                </div>
              </Link>
            </InfoSection>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <InfoSection title="관리 액션">
            <ReviewActionButtons
              reviewId={review.id}
              currentStatus={review.status}
              isBest={review.is_best}
              pointRewarded={review.point_rewarded}
            />
          </InfoSection>

          <InfoSection title="작성자">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {review.user?.profile_image_url ? (
                  <AvatarImage src={review.user.profile_image_url} alt={review.user.name} />
                ) : null}
                <AvatarFallback>{review.user?.name?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">
                  {review.user?.name ?? '—'}
                </p>
                <Link
                  href={`/members/${review.user_id}`}
                  className="text-[11px] text-[var(--mz-accent)] hover:underline"
                >
                  회원 상세 →
                </Link>
              </div>
            </div>
          </InfoSection>

          <InfoSection title="타임스탬프">
            <dl>
              <InfoRow label="작성">
                <span className="text-[12px]">
                  {new Date(review.created_at).toLocaleString('ko-KR')}
                </span>
              </InfoRow>
              <InfoRow label="수정">
                <span className="text-[12px]">
                  {new Date(review.updated_at).toLocaleString('ko-KR')}
                </span>
              </InfoRow>
              <InfoRow label="포인트">
                {review.point_rewarded ? (
                  <Badge variant="success">지급 완료</Badge>
                ) : (
                  <Badge variant="muted">미지급</Badge>
                )}
              </InfoRow>
            </dl>
          </InfoSection>
        </div>
      </div>
    </div>
  );
}
