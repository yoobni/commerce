import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { CouponStatus, CouponType, CouponIssuanceStatus } from '@commerce/types';
import {
  adminGetCoupon,
  adminGetCouponIssuances,
  adminGetCouponStats,
} from '@/lib/queries/coupons';
import { getSession } from '@/lib/auth/session';
import { IssueForm } from './_components/IssueForm';
import { PauseCouponButton } from './_components/PauseCouponButton';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<CouponStatus, string> = {
  ACTIVE: '활성',
  PAUSED: '일시정지',
  EXPIRED: '만료',
  DEPLETED: '소진',
};

const STATUS_BADGE: Record<CouponStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  DEPLETED: 'bg-red-100 text-red-600',
};

const ISSUANCE_STATUS_LABEL: Record<CouponIssuanceStatus, string> = {
  ISSUED: '발급됨',
  USED: '사용됨',
  EXPIRED: '만료',
  REVOKED: '회수됨',
};

const ISSUANCE_STATUS_BADGE: Record<CouponIssuanceStatus, string> = {
  ISSUED: 'bg-blue-100 text-blue-700',
  USED: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  REVOKED: 'bg-red-100 text-red-600',
};

const TYPE_LABEL: Record<CouponType, string> = {
  PERCENTAGE: '% 할인',
  FIXED_AMOUNT: '정액 할인',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDiscount(type: CouponType, value: number, currency: string | null): string {
  if (type === 'PERCENTAGE') return `${value}%`;
  return `${value.toLocaleString()} ${currency ?? ''}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ issuance_page?: string }>;
}

export default async function CouponDetailPage({ params, searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const sp = await searchParams;
  const issuancePage = Number(sp.issuance_page ?? 1);

  const [coupon, stats, issuances] = await Promise.all([
    adminGetCoupon(id),
    adminGetCouponStats(id),
    adminGetCouponIssuances({ couponId: id, page: issuancePage }),
  ]);

  if (!coupon) notFound();

  return (
    <div className="max-w-6xl">
      {/* Back */}
      <Link
        href="/coupons"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        ← 쿠폰 목록
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Info + Actions */}
        <div className="col-span-1 space-y-4">
          {/* Info card */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-mono text-lg font-bold text-[var(--color-text-primary)] tracking-widest">
                  {coupon.code}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                  {coupon.name_ko}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[coupon.status]}`}
              >
                {STATUS_LABELS[coupon.status]}
              </span>
            </div>

            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">유형</dt>
                <dd className="text-[var(--color-text-primary)]">{TYPE_LABEL[coupon.type]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">할인</dt>
                <dd className="font-semibold text-[var(--color-text-primary)]">
                  {formatDiscount(coupon.type, coupon.discount_value, coupon.currency)}
                </dd>
              </div>
              {coupon.max_discount_amount !== null && (
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">최대 할인</dt>
                  <dd className="text-[var(--color-text-primary)]">
                    {coupon.max_discount_amount.toLocaleString()}
                  </dd>
                </div>
              )}
              {coupon.min_order_amount !== null && (
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">최소 주문</dt>
                  <dd className="text-[var(--color-text-primary)]">
                    {coupon.min_order_amount.toLocaleString()}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">1인 한도</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {coupon.max_use_per_user}회
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">총 발급 한도</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {coupon.max_issuance_count?.toLocaleString() ?? '무제한'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">중복 사용</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {coupon.is_combinable ? '허용' : '불가'}
                </dd>
              </div>
              <div className="pt-1 border-t border-[var(--color-border-subtle)]">
                <dt className="text-[var(--color-text-secondary)] mb-0.5">유효기간</dt>
                <dd className="text-xs text-[var(--color-text-primary)]">
                  {formatDate(coupon.starts_at)}
                  <br />~ {formatDate(coupon.expires_at)}
                </dd>
              </div>
            </dl>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
              <Link
                href={`/coupons/${coupon.id}/edit`}
                className="px-3 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                수정
              </Link>
              <PauseCouponButton couponId={coupon.id} currentStatus={coupon.status} />
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              사용 현황
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '총 발급', value: stats.total_issued, color: 'text-blue-600' },
                { label: '사용됨', value: stats.total_used, color: 'text-green-600' },
                { label: '만료됨', value: stats.total_expired, color: 'text-gray-500' },
                { label: '회수됨', value: stats.total_revoked, color: 'text-red-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-xl font-bold ${color}`}>{value.toLocaleString()}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            {stats.total_issued > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                  <span>사용률</span>
                  <span>
                    {Math.round((stats.total_used / stats.total_issued) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${Math.round((stats.total_used / stats.total_issued) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Issue form */}
          <IssueForm
            couponId={coupon.id}
            adminId={session.id}
            couponExpiresAt={coupon.expires_at}
          />
        </div>

        {/* Right: Issuance list */}
        <div className="col-span-2">
          <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                발급 내역{' '}
                <span className="text-[var(--color-text-secondary)] font-normal">
                  ({issuances.total.toLocaleString()}건)
                </span>
              </h2>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">회원</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">이메일</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">발급일</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">만료일</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">사용일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {issuances.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-[var(--color-text-tertiary)]"
                    >
                      발급 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  issuances.data.map((issuance) => (
                    <tr key={issuance.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                        {issuance.user?.name ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {issuance.user?.email ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${ISSUANCE_STATUS_BADGE[issuance.status]}`}
                        >
                          {ISSUANCE_STATUS_LABEL[issuance.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                        {new Date(issuance.issued_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                        {new Date(issuance.expires_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                        {issuance.used_at
                          ? new Date(issuance.used_at).toLocaleDateString('ko-KR')
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Issuance pagination */}
            {issuances.total > issuances.per_page && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
                <span>
                  {issuancePage}페이지 / 총 {issuances.total.toLocaleString()}건
                </span>
                <div className="flex gap-2">
                  {issuancePage > 1 && (
                    <Link
                      href={`/coupons/${coupon.id}?issuance_page=${issuancePage - 1}`}
                      className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
                    >
                      이전
                    </Link>
                  )}
                  {issuances.has_next && (
                    <Link
                      href={`/coupons/${coupon.id}?issuance_page=${issuancePage + 1}`}
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
      </div>
    </div>
  );
}
