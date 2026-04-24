import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { OrderStatus } from '@commerce/types';
import { adminGetOrder, ORDER_STATUS_LABEL, ORDER_STATUS_BADGE } from '@/lib/queries/orders';
import OrderStatusActions from './_components/OrderStatusActions';
import AdminMemoForm from './_components/AdminMemoForm';

export const metadata = { title: '주문 상세' };

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

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await adminGetOrder(id);
  if (!order) notFound();

  const statusLabel = ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status;
  const statusBadge = ORDER_STATUS_BADGE[order.status as OrderStatus] ?? 'bg-gray-100 text-gray-500';

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/orders"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          ← 주문 목록
        </Link>
        <span className="text-[var(--color-text-tertiary)]">/</span>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          {order.order_number}
        </h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer info */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">고객 정보</h2>
          {order.user ? (
            <dl className="space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="w-20 text-[var(--color-text-secondary)] shrink-0">이름</dt>
                <dd className="text-[var(--color-text-primary)] font-medium">
                  <Link href={`/members/${order.user.id}`} className="text-blue-600 hover:underline">
                    {order.user.name}
                  </Link>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 text-[var(--color-text-secondary)] shrink-0">이메일</dt>
                <dd className="text-[var(--color-text-primary)]">{order.user.email}</dd>
              </div>
              {order.user.phone && (
                <div className="flex gap-3">
                  <dt className="w-20 text-[var(--color-text-secondary)] shrink-0">연락처</dt>
                  <dd className="text-[var(--color-text-primary)]">{order.user.phone}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-[var(--color-text-tertiary)]">회원 정보 없음</p>
          )}
        </section>

        {/* Shipping address */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">배송지</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-3">
              <dt className="w-20 text-[var(--color-text-secondary)] shrink-0">수령인</dt>
              <dd className="text-[var(--color-text-primary)] font-medium">
                {order.shipping_address_snapshot.recipient_name}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 text-[var(--color-text-secondary)] shrink-0">연락처</dt>
              <dd className="text-[var(--color-text-primary)]">
                {order.shipping_address_snapshot.phone}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 text-[var(--color-text-secondary)] shrink-0">주소</dt>
              <dd className="text-[var(--color-text-primary)]">
                [{order.shipping_address_snapshot.postal_code}]{' '}
                {order.shipping_address_snapshot.city},{' '}
                {order.shipping_address_snapshot.address_line1}
                {order.shipping_address_snapshot.address_line2
                  ? ` ${order.shipping_address_snapshot.address_line2}`
                  : ''}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Order items */}
      <section className="bg-white border border-[var(--color-border)] rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">주문 상품</h2>
        {order.items.length === 0 ? (
          <p className="text-sm text-[var(--color-text-tertiary)]">주문 상품이 없습니다.</p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex gap-4">
                {item.product_snapshot.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product_snapshot.thumbnail_url}
                    alt={item.product_snapshot.name}
                    className="w-14 h-14 object-cover rounded-lg border border-[var(--color-border)] shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {item.product_snapshot.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {item.product_snapshot.size} · {item.product_snapshot.color} · SKU:{' '}
                    {item.product_snapshot.sku}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    수량 {item.quantity}개 · {formatAmount(item.unit_price, order.currency)}/개
                  </p>
                </div>
                <div className="text-sm font-semibold text-[var(--color-text-primary)] shrink-0">
                  {formatAmount(item.total_price, order.currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Payment summary */}
      <section className="bg-white border border-[var(--color-border)] rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">결제 내역</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--color-text-secondary)]">상품 금액</dt>
            <dd className="text-[var(--color-text-primary)]">
              {formatAmount(order.subtotal, order.currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--color-text-secondary)]">배송비</dt>
            <dd className="text-[var(--color-text-primary)]">
              {formatAmount(order.shipping_fee, order.currency)}
            </dd>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-secondary)]">할인</dt>
              <dd className="text-red-600">-{formatAmount(order.discount_amount, order.currency)}</dd>
            </div>
          )}
          {order.point_used > 0 && (
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-secondary)]">포인트 사용</dt>
              <dd className="text-red-600">-{order.point_used.toLocaleString()}P</dd>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-[var(--color-border)]">
            <dt className="font-semibold text-[var(--color-text-primary)]">최종 결제</dt>
            <dd className="font-bold text-[var(--color-text-primary)] text-base">
              {formatAmount(order.total_amount, order.currency)}
            </dd>
          </div>
        </dl>
        {order.cancel_reason && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 rounded p-2">
            취소 사유: {order.cancel_reason}
          </p>
        )}
        {order.return_reason && (
          <p className="mt-3 text-xs text-orange-600 bg-orange-50 rounded p-2">
            반품 사유: {order.return_reason}
          </p>
        )}
      </section>

      {/* Status change */}
      <section className="bg-white border border-[var(--color-border)] rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">상태 변경</h2>
        <OrderStatusActions orderId={order.id} currentStatus={order.status as OrderStatus} />
      </section>

      {/* Admin memo */}
      <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">내부 메모</h2>
        <AdminMemoForm orderId={order.id} initialMemo={order.admin_memo} />
      </section>
    </div>
  );
}
