import Link from 'next/link';
import type { CouponStatus, CouponType } from '@commerce/types';
import { adminListCoupons } from '@/lib/queries/coupons';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<CouponStatus | 'ALL', string> = {
  ALL: '전체',
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

const TYPE_LABEL: Record<CouponType, string> = {
  PERCENTAGE: '% 할인',
  FIXED_AMOUNT: '정액 할인',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDiscount(type: CouponType, value: number, currency: string | null): string {
  if (type === 'PERCENTAGE') return `${value}%`;
  return `${value.toLocaleString()} ${currency ?? ''}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export const metadata = { title: '쿠폰 관리' };

export default async function CouponsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as CouponStatus | 'ALL') ?? 'ALL';
  const search = params.search ?? '';
  const page = Number(params.page ?? 1);

  const result = await adminListCoupons({ status, search: search || undefined, page });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">쿠폰 관리</h1>
        <Link
          href="/coupons/new"
          className="px-4 py-2 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          + 쿠폰 생성
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {(['ALL', 'ACTIVE', 'PAUSED', 'EXPIRED', 'DEPLETED'] as const).map((s) => (
            <Link
              key={s}
              href={`/coupons?status=${s}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                status === s
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-2 ml-auto">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="코드 또는 쿠폰명 검색"
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input type="hidden" name="status" value={status} />
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90"
          >
            검색
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">코드</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">쿠폰명</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">유형</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">할인</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">유효기간</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">생성일</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                  쿠폰이 없습니다.
                </td>
              </tr>
            ) : (
              result.data.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/coupons/${coupon.id}`}
                      className="font-mono text-blue-600 hover:underline font-medium tracking-wider"
                    >
                      {coupon.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-primary)]">{coupon.name_ko}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {TYPE_LABEL[coupon.type]}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    {formatDiscount(coupon.type, coupon.discount_value, coupon.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[coupon.status]}`}
                    >
                      {STATUS_LABELS[coupon.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)] text-xs">
                    <div>{new Date(coupon.starts_at).toLocaleDateString('ko-KR')}</div>
                    <div className="text-[var(--color-text-tertiary)]">
                      ~ {new Date(coupon.expires_at).toLocaleDateString('ko-KR')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {new Date(coupon.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/coupons/${coupon.id}/edit`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      수정
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {result.total > result.per_page && (
        <div className="flex items-center justify-between mt-4 text-sm text-[var(--color-text-secondary)]">
          <span>
            총 {result.total.toLocaleString()}개 · {page}페이지
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/coupons?status=${status}&search=${encodeURIComponent(search)}&page=${page - 1}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                이전
              </Link>
            )}
            {result.has_next && (
              <Link
                href={`/coupons?status=${status}&search=${encodeURIComponent(search)}&page=${page + 1}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                다음
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
