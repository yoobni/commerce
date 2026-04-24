import Link from 'next/link';
import type { CouponStatus } from '@commerce/types';
import { adminListCoupons } from '@/lib/queries/coupons';
import {
  PageHeader,
  StatusTabs,
  SearchBar,
  SectionCard,
  Pagination,
  Badge,
} from '@/components/ui';

export const metadata = { title: '쿠폰 관리' };

// ─── Labels & badge variants ───────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'accent';

const COUPON_STATUS_LABEL: Record<CouponStatus, string> = {
  ACTIVE: '활성',
  PAUSED: '일시정지',
  EXPIRED: '만료',
  DEPLETED: '소진',
};

const COUPON_STATUS_VARIANT: Record<CouponStatus, BadgeVariant> = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  EXPIRED: 'neutral',
  DEPLETED: 'danger',
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
    const merged: Record<string, string | undefined> = {
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
      <PageHeader
        title="쿠폰 관리"
        actions={
          <Link
            href="/coupons/new"
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
          >
            + 쿠폰 생성
          </Link>
        }
      />

      {/* Filters row */}
      <div className="flex flex-wrap items-start gap-3 mb-6">
        <StatusTabs
          tabs={STATUS_TABS}
          current={status}
          buildHref={(value) => `/coupons${buildQuery({ status: value, page: '1' })}`}
        />
        <SearchBar
          defaultValue={search}
          placeholder="코드 / 쿠폰명 검색"
          hiddenFields={[{ name: 'status', value: status }]}
          resetHref={`/coupons${buildQuery({ search: undefined, page: '1' })}`}
        />
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">쿠폰코드</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">쿠폰명</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">종류</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">할인</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">발급 / 사용</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">유효기간</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {result.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                    쿠폰이 없습니다.
                  </td>
                </tr>
              ) : (
                result.data.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/coupons/${coupon.id}`}
                        className="font-mono text-sm font-medium text-[var(--color-link)] hover:underline"
                      >
                        {coupon.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">
                      {coupon.name_ko}
                    </td>
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
                          {' '}(한도: {coupon.max_issuance_count.toLocaleString()})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                      <div>{new Date(coupon.starts_at).toLocaleDateString('ko-KR')}</div>
                      <div>~ {new Date(coupon.expires_at).toLocaleDateString('ko-KR')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={COUPON_STATUS_VARIANT[coupon.status]}>
                        {COUPON_STATUS_LABEL[coupon.status]}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Pagination
        page={page}
        total={result.total}
        perPage={result.per_page}
        hasNext={result.has_next}
        buildHref={(p) => `/coupons${buildQuery({ page: String(p) })}`}
      />
    </div>
  );
}
