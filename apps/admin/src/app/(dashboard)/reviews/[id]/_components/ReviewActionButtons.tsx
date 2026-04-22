'use client';

import { useTransition } from 'react';
import { setReviewStatus, toggleReviewBest, setReviewPointRewarded } from '@/lib/actions/reviews';
import type { ReviewStatus } from '@commerce/types';

interface Props {
  reviewId: string;
  currentStatus: ReviewStatus;
  isBest: boolean;
  pointRewarded: boolean;
}

export function ReviewActionButtons({ reviewId, currentStatus, isBest, pointRewarded }: Props) {
  const [pending, startTransition] = useTransition();

  function handleStatus(status: ReviewStatus) {
    startTransition(() => {
      setReviewStatus(reviewId, status).catch(console.error);
    });
  }

  function handleBest() {
    startTransition(() => {
      toggleReviewBest(reviewId, !isBest).catch(console.error);
    });
  }

  function handlePoint() {
    startTransition(() => {
      setReviewPointRewarded(reviewId, !pointRewarded).catch(console.error);
    });
  }

  return (
    <div className="space-y-2">
      {currentStatus === 'ACTIVE' ? (
        <button
          onClick={() => handleStatus('HIDDEN')}
          disabled={pending}
          className="w-full py-2 text-sm font-medium border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-60 transition-colors"
        >
          숨김 처리
        </button>
      ) : currentStatus === 'HIDDEN' ? (
        <button
          onClick={() => handleStatus('ACTIVE')}
          disabled={pending}
          className="w-full py-2 text-sm font-medium border border-green-200 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-60 transition-colors"
        >
          노출 복구
        </button>
      ) : null}

      {currentStatus !== 'DELETED' && (
        <button
          onClick={() => handleStatus('DELETED')}
          disabled={pending}
          className="w-full py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors"
        >
          삭제 처리
        </button>
      )}

      <div className="border-t border-[var(--color-border)] pt-3 mt-3 space-y-2">
        <button
          onClick={handleBest}
          disabled={pending}
          className={`w-full py-2 text-sm font-medium rounded-lg disabled:opacity-60 transition-colors border ${
            isBest
              ? 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50'
          }`}
        >
          {isBest ? '베스트 해제' : '베스트 지정'}
        </button>

        <button
          onClick={handlePoint}
          disabled={pending}
          className={`w-full py-2 text-sm font-medium rounded-lg disabled:opacity-60 transition-colors border ${
            pointRewarded
              ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50'
          }`}
        >
          {pointRewarded ? '포인트 지급 취소' : '포인트 지급'}
        </button>
      </div>
    </div>
  );
}
