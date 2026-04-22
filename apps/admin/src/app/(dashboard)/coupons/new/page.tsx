import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { CouponForm } from '@/components/coupons/CouponForm';

export const metadata = { title: '쿠폰 생성' };

export default async function CouponNewPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="max-w-2xl">
      <Link
        href="/coupons"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        ← 쿠폰 목록
      </Link>

      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">쿠폰 생성</h1>

      <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
        <CouponForm adminId={session.id} />
      </div>
    </div>
  );
}
