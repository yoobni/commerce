import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { CouponIssuanceStatus } from '@commerce/types';
import { adminGetCoupon, adminListCouponIssuances } from '@/lib/queries/coupons';
import { CouponForm } from '../_components/CouponForm';
import { CouponStatusActions } from './_components/CouponStatusActions';
import { IssueForm } from './_components/IssueForm';
import { RevokeButton } from './_components/RevokeButton';

// ─── Labels ───────────────────────────────────────────────────────────────────

const ISSUANCE_STATUS_LABEL: Record<CouponIssuanceStatus, string> = {
  ISSUED: '발급됨',
  USED: '사용됨',
  EXPIRED: '만료',
  REVOKED: '취소됨',
};

const ISSUANCE_STATUS_BADGE: Record<CouponIssuanceStatus, string> = {
  ISSUED: 'bg-blue-100 text-blue-700',
  USED: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  REVOKED: 'bg-red-100 text-red-500',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CouponDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  const [coupon, issuances] = await Promise.all([
    adminGetCoupon(id),
    adminListCouponIssuances(id, { page }),
  ]);

  if (!coupon) notFound();

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/coupons"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          ← 쿠폰 목록
        </Link>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)] font-mono">
          {coupon.code}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-6 items-start">
        {/* Left: Edit form */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
              쿠폰 정보
            </h2>
            <CouponForm coupon={coupon} />
          </div>

          {/* Issuance list */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                발급 내역
                <span className="ml-2 text-xs font-normal text-[var(--color-text-tertiary)]">
                  총 {issuances.total.toLocaleString()}건
                </span>
              </h2>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                    회원
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                    발급일
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                    만료일
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                    사용일
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {issuances.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-[var(--color-text-tertiary)]"
                    >
                      발급 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  issuances.data.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        {row.user ? (
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">
                              {row.user.name}
                            </p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                              {row.user.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[var(--color-text-tertiary)]">삭제된 회원</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                        {new Date(row.issued_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                        {new Date(row.expires_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            ISSUANCE_STATUS_BADGE[row.status]
                          }`}
                        >
                          {ISSUANCE_STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                        {row.used_at ? new Date(row.used_at).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.status === 'ISSUED' && (
                          <RevokeButton issuanceId={row.id} couponId={coupon.id} />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Issuance pagination */}
            {issuances.total > issuances.per_page && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
                <span>{page}페이지</span>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={`/coupons/${id}?page=${page - 1}`}
                      className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
                    >
                      이전
                    </Link>
                  )}
                  {issuances.has_next && (
                    <Link
                      href={`/coupons/${id}?page=${page + 1}`}
                      className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
                    >
                      다음
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Status + Issue */}
        <div className="space-y-4">
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
              상태 관리
            </h2>
            <CouponStatusActions couponId={coupon.id} currentStatus={coupon.status} />
          </div>

          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
              쿠폰 발급
            </h2>
            <IssueForm couponId={coupon.id} />
          </div>

          {/* Coupon summary */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 space-y-2 text-sm">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">요약</h2>
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>종류</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {coupon.type === 'FIXED_AMOUNT' ? '정액' : '정률'}
              </span>
            </div>
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>할인</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {coupon.type === 'PERCENTAGE'
                  ? `${coupon.discount_value}%`
                  : `${coupon.discount_value.toLocaleString()} ${coupon.currency ?? ''}`}
              </span>
            </div>
            {coupon.min_order_amount !== null && (
              <div className="flex justify-between text-[var(--color-text-secondary)]">
                <span>최소 주문</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {coupon.min_order_amount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>1인 한도</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {coupon.max_use_per_user}회
              </span>
            </div>
            {coupon.max_issuance_count !== null && (
              <div className="flex justify-between text-[var(--color-text-secondary)]">
                <span>총 발급 한도</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {coupon.max_issuance_count.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>중복 사용</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {coupon.is_combinable ? '허용' : '불가'}
              </span>
            </div>
            <div className="pt-2 border-t border-[var(--color-border)]">
              <div className="text-xs text-[var(--color-text-tertiary)]">유효기간</div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {new Date(coupon.starts_at).toLocaleDateString('ko-KR')}
                {' ~ '}
                {new Date(coupon.expires_at).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
