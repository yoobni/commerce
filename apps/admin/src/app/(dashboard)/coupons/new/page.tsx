import Link from 'next/link';
import { CouponForm } from '../_components/CouponForm';

export default function CouponNewPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/coupons"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          ← 쿠폰 목록
        </Link>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">쿠폰 생성</h1>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
        <CouponForm coupon={null} />
      </div>
    </div>
  );
}
