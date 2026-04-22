import { pauseCoupon, resumeCoupon } from '@/lib/actions/coupons';
import type { CouponStatus } from '@commerce/types';

interface PauseCouponButtonProps {
  couponId: string;
  currentStatus: CouponStatus;
}

export function PauseCouponButton({ couponId, currentStatus }: PauseCouponButtonProps) {
  if (currentStatus !== 'ACTIVE' && currentStatus !== 'PAUSED') return null;

  if (currentStatus === 'ACTIVE') {
    async function handlePause() {
      'use server';
      await pauseCoupon(couponId);
    }
    return (
      <form action={handlePause}>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm border border-[var(--color-warning)] text-[var(--color-warning)] rounded-lg hover:bg-yellow-50 transition-colors"
        >
          일시정지
        </button>
      </form>
    );
  }

  async function handleResume() {
    'use server';
    await resumeCoupon(couponId);
  }
  return (
    <form action={handleResume}>
      <button
        type="submit"
        className="px-3 py-1.5 text-sm border border-[var(--color-success)] text-[var(--color-success)] rounded-lg hover:bg-green-50 transition-colors"
      >
        재개
      </button>
    </form>
  );
}
