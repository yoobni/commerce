import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { UserStatus } from '@commerce/types';
import {
  adminGetMember,
  adminGetMemberOrders,
  MEMBER_STATUS_LABEL,
  MEMBER_STATUS_BADGE,
  AUTH_PROVIDER_LABEL,
  AUTH_PROVIDER_BADGE,
} from '@/lib/queries/members';
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE } from '@/lib/queries/orders';
import { Badge } from '@/components/ui/Badge';
import { MemberStatusActions } from './_components/MemberStatusActions';

export const metadata = { title: '회원 상세' };

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--color-border)] bg-gray-50">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-2 border-b border-[var(--color-border-subtle)] last:border-0">
      <dt className="w-28 shrink-0 text-xs font-medium text-[var(--color-text-tertiary)] pt-0.5">
        {label}
      </dt>
      <dd className="flex-1 text-sm text-[var(--color-text-primary)]">{children}</dd>
    </div>
  );
}

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member, recentOrders] = await Promise.all([
    adminGetMember(id),
    adminGetMemberOrders(id, 5),
  ]);
  if (!member) notFound();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/members"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-border)] hover:bg-gray-50 transition-colors"
          aria-label="목록으로"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">{member.name}</h1>
          <p className="text-xs text-[var(--color-text-tertiary)]">{member.email}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge className={MEMBER_STATUS_BADGE[member.status as UserStatus]}>
            {MEMBER_STATUS_LABEL[member.status as UserStatus]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent orders */}
          <SectionCard title="최근 주문">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-[var(--color-text-tertiary)]">주문 내역이 없습니다.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="pb-2 text-left font-medium text-[var(--color-text-secondary)] text-xs">
                      주문번호
                    </th>
                    <th className="pb-2 text-right font-medium text-[var(--color-text-secondary)] text-xs">
                      결제금액
                    </th>
                    <th className="pb-2 text-left font-medium text-[var(--color-text-secondary)] text-xs pl-4">
                      상태
                    </th>
                    <th className="pb-2 text-left font-medium text-[var(--color-text-secondary)] text-xs pl-4">
                      주문일
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-mono text-xs text-blue-600 hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="py-2 text-right font-medium">
                        {order.total_amount.toLocaleString()}
                      </td>
                      <td className="py-2 pl-4">
                        <Badge
                          className={
                            ORDER_STATUS_BADGE[order.status as keyof typeof ORDER_STATUS_BADGE] ??
                            'bg-gray-100 text-gray-500'
                          }
                        >
                          {ORDER_STATUS_LABEL[order.status as keyof typeof ORDER_STATUS_LABEL] ??
                            order.status}
                        </Badge>
                      </td>
                      <td className="py-2 pl-4 text-[var(--color-text-secondary)]">
                        {new Date(order.ordered_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>

          {/* Status management */}
          <SectionCard title="상태 관리">
            <MemberStatusActions memberId={member.id} currentStatus={member.status as UserStatus} />
          </SectionCard>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Profile */}
          <SectionCard title="회원 정보">
            <dl>
              <InfoRow label="이름">{member.name}</InfoRow>
              <InfoRow label="이메일">{member.email}</InfoRow>
              {member.phone && <InfoRow label="전화번호">{member.phone}</InfoRow>}
              <InfoRow label="가입경로">
                <Badge className={AUTH_PROVIDER_BADGE[member.provider]}>
                  {AUTH_PROVIDER_LABEL[member.provider]}
                </Badge>
              </InfoRow>
              <InfoRow label="국가">{member.country}</InfoRow>
              <InfoRow label="통화">{member.currency}</InfoRow>
              <InfoRow label="언어">{member.locale}</InfoRow>
              <InfoRow label="마케팅 동의">{member.marketing_agreed ? '동의' : '미동의'}</InfoRow>
            </dl>
          </SectionCard>

          {/* Activity */}
          <SectionCard title="활동 정보">
            <dl>
              <InfoRow label="마지막 로그인">
                {member.last_login_at ? (
                  new Date(member.last_login_at).toLocaleString('ko-KR')
                ) : (
                  <span className="text-[var(--color-text-tertiary)]">없음</span>
                )}
              </InfoRow>
              <InfoRow label="가입일">
                {new Date(member.created_at).toLocaleString('ko-KR')}
              </InfoRow>
              <InfoRow label="회원 ID">
                <span className="font-mono text-xs break-all">{member.id}</span>
              </InfoRow>
            </dl>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
