'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { revokeCouponIssuance } from '@/lib/actions/coupons';

interface Props {
  issuanceId: string;
  couponId: string;
}

export function RevokeButton({ issuanceId, couponId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRevoke() {
    if (!confirm('이 쿠폰 발급을 취소하시겠습니까?')) return;

    startTransition(async () => {
      try {
        await revokeCouponIssuance(issuanceId, couponId);
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : '취소 실패');
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleRevoke}
      disabled={isPending}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-60"
    >
      {isPending ? '처리 중...' : '취소'}
    </button>
  );
}
