import Link from 'next/link';
import type { CouponStatus } from '@commerce/types';
import { adminListCoupons } from '@/lib/queries/coupons';

// ─── Labels & badges ──────────────────────────────────────────────────────────

const COUPON_STATUS_LABEL: Record<CouponStatus, string> = {
  ACTIVE: '활성',
  PAUSED: '일시정지',
  EXPIRED: '만료',
  DEPLETED: '소진',
};

const COUPON_STATUS_BADGE: Record<CouponStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  DEPLETED: 'bg-red-100 text-red-700',
};

const STATUS_TABS: Array<{ value: CouponStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'PAUSED', label: '일시정지' },
  { value: 'EXPIRED', label: '만료' },
  { value: 'DEPLETED', label: '소진' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function CouponsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as CouponStatus | 'ALL') ?? 'ALL';
  const search = params.search ?? '';
  const page = Number(params.page ?? 1);

  const result = await adminListCoupons({
    status,
    search: search || undefined,
    page,
  });

  function buildQuery(overrides: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    const merged = {
      status,
      search: search || undefined,
      page: String(page),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined) q.set(k, v);
    });
    const str = q.toString();
    return str ? '?' + str : '';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">쿠폰 관리</h1>
        <Link
          href="/coupons/new"
          className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90"
        >
          + 쿠폰 생성
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/coupons${buildQuery({ status: tab.value, page: '1' })}`}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                status === tab.value
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="GET" className="flex gap-2 ml-auto">
          <input type="hidden" name="status" value={status} />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="코드 / 쿠폰명 검색"
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90"
          >
            검색
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                쿠폰코드
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                쿠폰명
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                종류
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
                할인
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                발급 / 사용
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                유효기간
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {result.data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-[var(--color-text-tertiary)]"
                >
                  쿠폰이 없습니다.
                </td>
              </tr>
            ) : (
              result.data.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/coupons/${coupon.id}`}
                      className="font-mono text-sm font-medium text-blue-600 hover:underline"
                    >
                      {coupon.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-primary)]">{coupon.name_ko}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {coupon.type === 'FIXED_AMOUNT' ? '정액' : '정률'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[var(--color-text-primary)]">
                    {coupon.type === 'PERCENTAGE'
                      ? `${coupon.discount_value}%`
                      : `${coupon.discount_value.toLocaleString()} ${coupon.currency ?? ''}`}
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                    {coupon.issuance_count.toLocaleString()} / {coupon.used_count.toLocaleString()}
                    {coupon.max_issuance_count !== null && (
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        {' '}
                        (한도: {coupon.max_issuance_count.toLocaleString()})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                    <div>{new Date(coupon.starts_at).toLocaleDateString('ko-KR')}</div>
                    <div>~ {new Date(coupon.expires_at).toLocaleDateString('ko-KR')}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        COUPON_STATUS_BADGE[coupon.status]
                      }`}
                    >
                      {COUPON_STATUS_LABEL[coupon.status]}
                    </span>
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
            총 {result.total.toLocaleString()}건 · {page}페이지
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/coupons${buildQuery({ page: String(page - 1) })}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                이전
              </Link>
            )}
            {result.has_next && (
              <Link
                href={`/coupons${buildQuery({ page: String(page + 1) })}`}
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
