'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { CouponStatus } from '@commerce/types';
import { updateCouponStatus } from '@/lib/actions/coupons';

const STATUS_LABEL: Record<CouponStatus, string> = {
  ACTIVE: '활성',
  PAUSED: '일시정지',
  EXPIRED: '만료',
  DEPLETED: '소진',
};

const STATUS_BADGE: Record<CouponStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  DEPLETED: 'bg-red-100 text-red-700',
};

const NEXT_STATUS: Partial<Record<CouponStatus, Array<CouponStatus>>> = {
  ACTIVE: ['PAUSED'],
  PAUSED: ['ACTIVE'],
};

interface Props {
  couponId: string;
  currentStatus: CouponStatus;
}

export function CouponStatusActions({ couponId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(status: CouponStatus) {
    startTransition(async () => {
      try {
        await updateCouponStatus(couponId, status);
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : '상태 변경 실패');
      }
    });
  }

  const nextStatuses = NEXT_STATUS[currentStatus] ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-text-secondary)]">현재 상태</span>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[currentStatus]}`}
        >
          {STATUS_LABEL[currentStatus]}
        </span>
      </div>

      {nextStatuses.length > 0 && (
        <div className="flex flex-col gap-2">
          {nextStatuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleChange(s)}
              disabled={isPending}
              className="w-full py-2 text-sm font-medium border border-[var(--color-border)] rounded-lg hover:bg-gray-50 disabled:opacity-60 text-[var(--color-text-secondary)]"
            >
              {isPending ? '변경 중...' : `${STATUS_LABEL[s]}으로 변경`}
            </button>
          ))}
        </div>
      )}

      {currentStatus === 'EXPIRED' || currentStatus === 'DEPLETED' ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          이 쿠폰은 더 이상 상태를 변경할 수 없습니다.
        </p>
      ) : null}
    </div>
  );
}
