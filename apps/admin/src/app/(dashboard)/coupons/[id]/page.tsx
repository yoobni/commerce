import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { CouponIssuanceStatus } from '@commerce/types';
import {
  adminGetCoupon,
  adminListCouponIssuances,
  COUPON_ISSUANCE_STATUS_LABEL,
  COUPON_ISSUANCE_STATUS_VARIANT,
  COUPON_STATUS_LABEL,
  COUPON_STATUS_VARIANT,
} from '@/lib/queries/coupons';
import {
  Badge,
  Button,
  DataTable,
  type DataTableColumn,
  DataTablePagination,
  InfoRow,
  InfoSection,
  PageHeader,
} from '@/components/ui';
import { CouponForm } from '../_components/CouponForm';
import { CouponStatusActions } from './_components/CouponStatusActions';
import { IssueForm } from './_components/IssueForm';
import { RevokeButton } from './_components/RevokeButton';

export const metadata = { title: '쿠폰 상세' };

type IssuanceRow = Awaited<ReturnType<typeof adminListCouponIssuances>>['data'][number];

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CouponDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));

  const [coupon, issuances] = await Promise.all([
    adminGetCoupon(id),
    adminListCouponIssuances(id, { page }),
  ]);

  if (!coupon) notFound();

  const couponRef = coupon;

  const issuanceColumns: DataTableColumn<IssuanceRow>[] = [
    {
      key: 'user',
      header: '회원',
      cell: (r) =>
        r.user ? (
          <div>
            <div className="text-[13px] font-medium text-foreground">{r.user.name}</div>
            <div className="text-[11px] text-muted-foreground">{r.user.email}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">삭제된 회원</span>
        ),
    },
    {
      key: 'issued',
      header: '발급일',
      width: '120px',
      cell: (r) => (
        <span className="text-[12px] text-muted-foreground">
          {new Date(r.issued_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'expires',
      header: '만료일',
      width: '120px',
      cell: (r) => (
        <span className="text-[12px] text-muted-foreground">
          {new Date(r.expires_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'status',
      header: '상태',
      width: '90px',
      cell: (r) => (
        <Badge variant={COUPON_ISSUANCE_STATUS_VARIANT[r.status as CouponIssuanceStatus]}>
          {COUPON_ISSUANCE_STATUS_LABEL[r.status as CouponIssuanceStatus]}
        </Badge>
      ),
    },
    {
      key: 'used',
      header: '사용일',
      width: '120px',
      cell: (r) => (
        <span className="text-[12px] text-muted-foreground">
          {r.used_at ? new Date(r.used_at).toLocaleDateString('ko-KR') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '70px',
      cell: (r) => (r.status === 'ISSUED' ? <RevokeButton issuanceId={r.id} couponId={couponRef.id} /> : null),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/coupons">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> 쿠폰 목록
          </Link>
        </Button>
      </div>

      <PageHeader
        title={<span className="font-mono">{coupon.code}</span>}
        description={coupon.name_ko}
        actions={
          <Badge variant={COUPON_STATUS_VARIANT[coupon.status]}>
            {COUPON_STATUS_LABEL[coupon.status]}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          <InfoSection title="쿠폰 정보">
            <CouponForm coupon={coupon} />
          </InfoSection>

          <InfoSection title={`발급 내역 · ${issuances.total.toLocaleString()}건`}>
            <DataTable<IssuanceRow>
              columns={issuanceColumns}
              rows={issuances.data}
              rowKey={(r) => r.id}
              empty="발급 내역이 없습니다."
              footer={
                <DataTablePagination
                  page={page}
                  total={issuances.total}
                  perPage={issuances.per_page}
                  displayed={issuances.data.length}
                  unit="건"
                  buildHref={(p) => `/coupons/${coupon.id}?page=${p}`}
                />
              }
            />
          </InfoSection>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <InfoSection title="상태 관리">
            <CouponStatusActions couponId={coupon.id} currentStatus={coupon.status} />
          </InfoSection>

          <InfoSection title="쿠폰 발급">
            <IssueForm couponId={coupon.id} />
          </InfoSection>

          <InfoSection title="요약">
            <dl>
              <InfoRow label="종류">
                <Badge variant="outline">
                  {coupon.type === 'FIXED_AMOUNT' ? '정액' : '정률'}
                </Badge>
              </InfoRow>
              <InfoRow label="할인">
                <span className="font-mono font-medium">
                  {coupon.type === 'PERCENTAGE'
                    ? `${coupon.discount_value}%`
                    : `${coupon.discount_value.toLocaleString()} ${coupon.currency ?? ''}`}
                </span>
              </InfoRow>
              {coupon.min_order_amount !== null && (
                <InfoRow label="최소 주문">
                  <span className="font-mono">{coupon.min_order_amount.toLocaleString()}</span>
                </InfoRow>
              )}
              <InfoRow label="1인 한도">{coupon.max_use_per_user}회</InfoRow>
              {coupon.max_issuance_count !== null && (
                <InfoRow label="총 발급 한도">
                  <span className="font-mono">{coupon.max_issuance_count.toLocaleString()}</span>
                </InfoRow>
              )}
              <InfoRow label="중복 사용">
                {coupon.is_combinable ? (
                  <Badge variant="success">허용</Badge>
                ) : (
                  <Badge variant="muted">불가</Badge>
                )}
              </InfoRow>
              <InfoRow label="유효기간">
                <div className="text-[12px]">
                  <div>{new Date(coupon.starts_at).toLocaleDateString('ko-KR')}</div>
                  <div className="text-muted-foreground">
                    ~ {new Date(coupon.expires_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </InfoRow>
            </dl>
          </InfoSection>
        </div>
      </div>
    </div>
  );
}
