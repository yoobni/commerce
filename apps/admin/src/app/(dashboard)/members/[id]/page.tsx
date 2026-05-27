import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { UserStatus, OrderStatus } from '@commerce/types';
import {
  adminGetMember,
  adminGetMemberOrders,
  MEMBER_STATUS_LABEL,
  AUTH_PROVIDER_LABEL,
} from '@/lib/queries/members';
import { ORDER_STATUS_LABEL } from '@/lib/queries/orders';
import {
  Badge,
  type BadgeProps,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type DataTableColumn,
} from '@/components/ui';
import { MemberStatusActions } from './_components/MemberStatusActions';

export const metadata = { title: '회원 상세' };

const MEMBER_STATUS_VARIANT: Record<UserStatus, BadgeProps['variant']> = {
  ACTIVE: 'success',
  SUSPENDED: 'destructive',
  WITHDRAWN: 'muted',
};

const PROVIDER_VARIANT: Partial<Record<string, BadgeProps['variant']>> = {
  EMAIL: 'outline',
  GOOGLE: 'secondary',
  APPLE: 'secondary',
  KAKAO: 'warning',
  NAVER: 'success',
};

const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeProps['variant']> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'accent',
  PREPARING: 'accent',
  SHIPPED: 'accent',
  DELIVERED: 'success',
  CONFIRMED: 'success',
  RETURN_REQUESTED: 'warning',
  RETURNED: 'muted',
  REFUND_REQUESTED: 'destructive',
  REFUNDED: 'muted',
  CANCELLED: 'muted',
  DELIVERY_FAILED: 'destructive',
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-border py-2 last:border-0">
      <dt className="w-28 shrink-0 pt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="flex-1 text-[13px] text-foreground">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

type MemberOrder = Awaited<ReturnType<typeof adminGetMemberOrders>>[number];

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member, recentOrders] = await Promise.all([
    adminGetMember(id),
    adminGetMemberOrders(id, 5),
  ]);
  if (!member) notFound();

  const orderColumns: DataTableColumn<MemberOrder>[] = [
    {
      key: 'order',
      header: '주문번호',
      width: '180px',
      cell: (o) => (
        <Link
          href={`/orders/${o.id}`}
          className="font-mono text-[12.5px] text-foreground hover:text-[var(--mz-accent)] hover:underline"
        >
          {o.order_number}
        </Link>
      ),
    },
    {
      key: 'amount',
      header: '결제금액',
      align: 'right',
      cell: (o) => (
        <span className="font-mono text-[13px] font-medium">
          ₩{o.total_amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: '상태',
      width: '110px',
      cell: (o) => (
        <Badge variant={ORDER_STATUS_VARIANT[o.status as OrderStatus] ?? 'muted'}>
          {ORDER_STATUS_LABEL[o.status as OrderStatus] ?? o.status}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: '주문일',
      width: '120px',
      align: 'right',
      cell: (o) => (
        <span className="text-[12.5px] text-muted-foreground">
          {new Date(o.ordered_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/members" aria-label="목록으로">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
            {member.name}
          </h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{member.email}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={MEMBER_STATUS_VARIANT[member.status as UserStatus]}>
            {MEMBER_STATUS_LABEL[member.status as UserStatus]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          <Section title="최근 주문">
            {recentOrders.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">주문 내역이 없습니다.</p>
            ) : (
              <DataTable<MemberOrder>
                columns={orderColumns}
                rows={recentOrders}
                rowKey={(o) => o.id}
              />
            )}
          </Section>

          <Section title="상태 관리">
            <MemberStatusActions
              memberId={member.id}
              currentStatus={member.status as UserStatus}
            />
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Section title="회원 정보">
            <dl>
              <InfoRow label="이름">{member.name}</InfoRow>
              <InfoRow label="이메일">{member.email}</InfoRow>
              {member.phone && <InfoRow label="전화번호">{member.phone}</InfoRow>}
              <InfoRow label="가입경로">
                <Badge variant={PROVIDER_VARIANT[member.provider] ?? 'outline'}>
                  {AUTH_PROVIDER_LABEL[member.provider]}
                </Badge>
              </InfoRow>
              <InfoRow label="국가">{member.country}</InfoRow>
              <InfoRow label="통화">{member.currency}</InfoRow>
              <InfoRow label="언어">{member.locale}</InfoRow>
              <InfoRow label="마케팅">
                {member.marketing_agreed ? (
                  <Badge variant="success">동의</Badge>
                ) : (
                  <Badge variant="muted">미동의</Badge>
                )}
              </InfoRow>
            </dl>
          </Section>

          <Section title="활동 정보">
            <dl>
              <InfoRow label="마지막 로그인">
                {member.last_login_at ? (
                  new Date(member.last_login_at).toLocaleString('ko-KR')
                ) : (
                  <span className="text-muted-foreground">없음</span>
                )}
              </InfoRow>
              <InfoRow label="가입일">
                {new Date(member.created_at).toLocaleString('ko-KR')}
              </InfoRow>
              <InfoRow label="회원 ID">
                <span className="break-all font-mono text-[11px]">{member.id}</span>
              </InfoRow>
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
