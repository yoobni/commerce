import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { adminGetCoupon } from '@/lib/queries/coupons';
import { CouponForm } from '@/components/coupons/CouponForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: '쿠폰 수정' };

export default async function CouponEditPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const coupon = await adminGetCoupon(id);
  if (!coupon) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href={`/coupons/${id}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        ← 쿠폰 상세
      </Link>

      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
        쿠폰 수정 —{' '}
        <span className="font-mono text-[var(--color-brand-accent)]">{coupon.code}</span>
      </h1>

      <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
        <CouponForm adminId={session.id} initialData={coupon} />
      </div>
    </div>
  );
}
