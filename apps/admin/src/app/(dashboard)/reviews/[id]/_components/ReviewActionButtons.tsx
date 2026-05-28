'use client';

import { useTransition } from 'react';
import { Sparkles, Coins, EyeOff, Eye, Trash2 } from 'lucide-react';
import type { ReviewStatus } from '@commerce/types';
import { Button, type ButtonProps, toast } from '@/components/ui';
import { setReviewStatus, toggleReviewBest, setReviewPointRewarded } from '@/lib/actions/reviews';

interface Props {
  reviewId: string;
  currentStatus: ReviewStatus;
  isBest: boolean;
  pointRewarded: boolean;
}

export function ReviewActionButtons({ reviewId, currentStatus, isBest, pointRewarded }: Props) {
  const [pending, startTransition] = useTransition();

  function handleStatus(status: ReviewStatus, label: string) {
    startTransition(async () => {
      try {
        await setReviewStatus(reviewId, status);
        toast.success(`리뷰를 ${label} 처리했습니다.`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '상태 변경 실패');
      }
    });
  }

  function handleBest() {
    startTransition(async () => {
      try {
        await toggleReviewBest(reviewId, !isBest);
        toast.success(isBest ? '베스트에서 해제했습니다.' : '베스트로 지정했습니다.');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '베스트 토글 실패');
      }
    });
  }

  function handlePoint() {
    startTransition(async () => {
      try {
        await setReviewPointRewarded(reviewId, !pointRewarded);
        toast.success(pointRewarded ? '포인트 지급을 취소했습니다.' : '포인트를 지급했습니다.');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '포인트 처리 실패');
      }
    });
  }

  return (
    <div className="space-y-2">
      {currentStatus === 'ACTIVE' && (
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={() => handleStatus('HIDDEN', '숨김')}
          disabled={pending}
        >
          <EyeOff className="mr-1.5 h-4 w-4" />
          숨김 처리
        </Button>
      )}
      {currentStatus === 'HIDDEN' && (
        <Button
          variant="accent"
          size="md"
          className="w-full"
          onClick={() => handleStatus('ACTIVE', '노출')}
          disabled={pending}
        >
          <Eye className="mr-1.5 h-4 w-4" />
          노출 복구
        </Button>
      )}
      {currentStatus !== 'DELETED' && (
        <Button
          variant="destructive"
          size="md"
          className="w-full"
          onClick={() => handleStatus('DELETED', '삭제')}
          disabled={pending}
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          삭제 처리
        </Button>
      )}

      <div className="space-y-2 border-t border-border pt-3">
        <Button
          variant={(isBest ? 'accent' : 'outline') as ButtonProps['variant']}
          size="md"
          className="w-full"
          onClick={handleBest}
          disabled={pending}
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          {isBest ? '베스트 해제' : '베스트 지정'}
        </Button>
        <Button
          variant={(pointRewarded ? 'accent' : 'outline') as ButtonProps['variant']}
          size="md"
          className="w-full"
          onClick={handlePoint}
          disabled={pending}
        >
          <Coins className="mr-1.5 h-4 w-4" />
          {pointRewarded ? '포인트 지급 취소' : '포인트 지급'}
        </Button>
      </div>
    </div>
  );
}
