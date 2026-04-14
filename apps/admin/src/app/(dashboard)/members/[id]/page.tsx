import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { OrderStatus } from '@commerce/types';
import {
  adminGetMember,
  adminGetMemberOrders,
  adminGetMemberPoint,
  adminGetMemberPointTransactions,
  adminGetMemberSanctions,
} from '@/lib/queries/members';
import { SuspendForm } from './_components/SuspendForm';
import { UnsuspendButton } from './_components/UnsuspendButton';
import { GrantPointsForm } from './_components/GrantPointsForm';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '준비 중',
  SHIPPED: '배송 중',
  DELIVERED: '배송 완료',
  CONFIRMED: '구매 확정',
  RETURN_REQUESTED: '반품 요청',
  RETURNED: '반품 완료',
  REFUND_REQUESTED: '환불 요청',
  REFUNDED: '환불 완료',
  CANCELLED: '취소',
  DELIVERY_FAILED: '배송 실패',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [member, orders, point, pointTransactions, sanctions] = await Promise.all([
    adminGetMember(id),
    adminGetMemberOrders(id),
    adminGetMemberPoint(id),
    adminGetMemberPointTransactions(id),
    adminGetMemberSanctions(id),
  ]);

  if (!member) notFound();

  const isSuspended = member.status === 'SUSPENDED';
  const activeSanctions = sanctions.filter((s) => s.is_active);

  return (
    <div className="max-w-6xl">
      {/* Back */}
      <Link
        href="/members"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        ← 회원 목록
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Member info + actions */}
        <div className="col-span-1 space-y-4">
          {/* Profile card */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-600">
                {member.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold text-[var(--color-text-primary)]">{member.name}</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">{member.email}</p>
              </div>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">상태</dt>
                <dd>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      member.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : member.status === 'SUSPENDED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {member.status === 'ACTIVE' ? '활성' : member.status === 'SUSPENDED' ? '정지' : '탈퇴'}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">전화번호</dt>
                <dd className="text-[var(--color-text-primary)]">{member.phone ?? '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">국가</dt>
                <dd className="text-[var(--color-text-primary)]">{member.country}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">언어</dt>
                <dd className="text-[var(--color-text-primary)]">{member.locale}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">통화</dt>
                <dd className="text-[var(--color-text-primary)]">{member.currency}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">가입방식</dt>
                <dd className="text-[var(--color-text-primary)] capitalize">{member.provider}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">마케팅 수신</dt>
                <dd className="text-[var(--color-text-primary)]">{member.marketing_agreed ? '동의' : '미동의'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">가입일</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {new Date(member.created_at).toLocaleDateString('ko-KR')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">마지막 로그인</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {member.last_login_at
                    ? new Date(member.last_login_at).toLocaleDateString('ko-KR')
                    : '-'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Points */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h3 className="font-medium text-[var(--color-text-primary)] mb-3">포인트</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-600 mb-1">잔액</p>
                <p className="text-lg font-bold text-blue-700">
                  {(point?.balance ?? 0).toLocaleString()}P
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-[var(--color-text-secondary)] mb-1">총 적립</p>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">
                  {(point?.total_earned ?? 0).toLocaleString()}P
                </p>
              </div>
            </div>
            <GrantPointsForm userId={member.id} />
          </div>

          {/* Sanction actions */}
          {member.status !== 'WITHDRAWN' && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--color-text-primary)] mb-3">제재 관리</h3>
              {isSuspended ? (
                <div className="space-y-3">
                  <p className="text-sm text-red-600">현재 정지 상태입니다.</p>
                  {activeSanctions.length > 0 && (
                    <div className="text-xs text-[var(--color-text-secondary)] bg-red-50 rounded p-2">
                      <p className="font-medium text-red-700 mb-1">활성 제재</p>
                      {activeSanctions.map((s) => (
                        <p key={s.id}>
                          {s.type} — {s.reason}
                        </p>
                      ))}
                    </div>
                  )}
                  <UnsuspendButton userId={member.id} />
                </div>
              ) : (
                <SuspendForm userId={member.id} />
              )}
            </div>
          )}
        </div>

        {/* Right: Orders + Point history + Sanction history */}
        <div className="col-span-2 space-y-6">
          {/* Orders */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-medium text-[var(--color-text-primary)]">
                주문 이력 ({orders.length})
              </h3>
            </div>
            {orders.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                주문 내역이 없습니다.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문번호</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">결제금액</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {ORDER_STATUS_LABEL[order.status]}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {order.total_amount.toLocaleString()}
                        <span className="text-xs text-[var(--color-text-secondary)] ml-1">
                          {order.currency}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {new Date(order.ordered_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Point transactions */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-medium text-[var(--color-text-primary)]">
                포인트 내역 ({pointTransactions.length})
              </h3>
            </div>
            {pointTransactions.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                포인트 내역이 없습니다.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">유형</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">사유</th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">변동</th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">잔액</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {pointTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            tx.type.startsWith('EARN') || tx.type === 'ADMIN_GRANT' || tx.type === 'CANCEL_USE'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-[200px] truncate">
                        {tx.reason}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <span
                          className={
                            tx.type === 'USE' || tx.type === 'EXPIRE' || tx.type === 'ADMIN_DEDUCT' || tx.type === 'CANCEL_EARN'
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }
                        >
                          {tx.type === 'USE' || tx.type === 'EXPIRE' || tx.type === 'ADMIN_DEDUCT' || tx.type === 'CANCEL_EARN'
                            ? '-'
                            : '+'}
                          {tx.amount.toLocaleString()}P
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">
                        {tx.balance_after.toLocaleString()}P
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {new Date(tx.created_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Sanction history */}
          {sanctions.length > 0 && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-border)]">
                <h3 className="font-medium text-[var(--color-text-primary)]">
                  제재 이력 ({sanctions.length})
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">유형</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">사유</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">시작</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">종료</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {sanctions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{s.type}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-[200px] truncate">
                        {s.reason}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {new Date(s.starts_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {s.ends_at ? new Date(s.ends_at).toLocaleDateString('ko-KR') : '무기한'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.is_active ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {s.is_active ? '활성' : '해제'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
