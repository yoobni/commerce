import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { UserStatus, OrderStatus } from '@commerce/types';
import {
  adminGetMember,
  USER_STATUS_LABEL,
  USER_STATUS_BADGE,
} from '@/lib/queries/members';
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE } from '@/lib/queries/orders';
import MemberStatusActions from './_components/MemberStatusActions';

export const metadata = { title: '회원 상세' };

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

const PROVIDER_LABEL: Record<string, string> = {
  email: '이메일',
  google: 'Google',
  apple: 'Apple',
  kakao: 'Kakao',
  naver: 'Naver',
  twitter: 'X(Twitter)',
};

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const member = await adminGetMember(id);
  if (!member) notFound();

  const statusBadge = USER_STATUS_BADGE[member.status as UserStatus] ?? 'bg-gray-100 text-gray-500';
  const statusLabel = USER_STATUS_LABEL[member.status as UserStatus] ?? member.status;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/members"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          ← 회원 목록
        </Link>
        <span className="text-[var(--color-text-tertiary)]">/</span>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">{member.name}</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge}`}>
          {statusLabel}
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{member.order_count}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">총 주문 수</p>
        </div>
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {member.total_spent.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">총 구매금액 (KRW)</p>
        </div>
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 text-center col-span-2 md:col-span-1">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {PROVIDER_LABEL[member.provider] ?? member.provider}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">가입 경로</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Basic info */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">기본 정보</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-3">
              <dt className="w-24 text-[var(--color-text-secondary)] shrink-0">이메일</dt>
              <dd className="text-[var(--color-text-primary)]">{member.email}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 text-[var(--color-text-secondary)] shrink-0">연락처</dt>
              <dd className="text-[var(--color-text-primary)]">{member.phone ?? '-'}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 text-[var(--color-text-secondary)] shrink-0">국가</dt>
              <dd className="text-[var(--color-text-primary)]">{member.country}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 text-[var(--color-text-secondary)] shrink-0">통화</dt>
              <dd className="text-[var(--color-text-primary)]">{member.currency}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 text-[var(--color-text-secondary)] shrink-0">마케팅 동의</dt>
              <dd className={member.marketing_agreed ? 'text-green-600' : 'text-[var(--color-text-tertiary)]'}>
                {member.marketing_agreed ? '동의' : '미동의'}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 text-[var(--color-text-secondary)] shrink-0">마지막 로그인</dt>
              <dd className="text-[var(--color-text-secondary)]">
                {member.last_login_at
                  ? new Date(member.last_login_at).toLocaleString('ko-KR')
                  : '-'}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 text-[var(--color-text-secondary)] shrink-0">가입일</dt>
              <dd className="text-[var(--color-text-secondary)]">
                {new Date(member.created_at).toLocaleString('ko-KR')}
              </dd>
            </div>
          </dl>
        </section>

        {/* Status management */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">계정 관리</h2>
          <div className="mb-4">
            <p className="text-xs text-[var(--color-text-secondary)] mb-1">현재 상태</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge}`}>
              {statusLabel}
            </span>
          </div>
          {member.deleted_at && (
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              탈퇴일: {new Date(member.deleted_at).toLocaleString('ko-KR')}
            </p>
          )}
          <MemberStatusActions userId={member.id} currentStatus={member.status as UserStatus} />
        </section>
      </div>

      {/* Recent orders */}
      <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">최근 주문</h2>
        {member.recent_orders.length === 0 ? (
          <p className="text-sm text-[var(--color-text-tertiary)]">주문 내역이 없습니다.</p>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">주문번호</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">결제금액</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">주문일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {member.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-mono text-xs text-blue-600 hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--color-text-primary)]">
                      {formatAmount(order.total_amount, order.currency)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ORDER_STATUS_BADGE[order.status as OrderStatus] ?? 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                      {new Date(order.ordered_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
