import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { OrderStatus } from '@commerce/types';
import { adminGetOrder, ORDER_STATUS_LABEL, ORDER_STATUS_BADGE } from '@/lib/queries/orders';
import { Badge } from '@/components/ui/Badge';
import { OrderStatusActions } from './_components/OrderStatusActions';
import { AdminMemoForm } from './_components/AdminMemoForm';
import { RefundForm } from './_components/RefundForm';

export const metadata = { title: '주문 상세' };

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
      <dt className="w-32 shrink-0 text-xs font-medium text-[var(--color-text-tertiary)] pt-0.5">{label}</dt>
      <dd className="flex-1 text-sm text-[var(--color-text-primary)]">{children}</dd>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await adminGetOrder(id);
  if (!order) notFound();

  const addr = order.shipping_address_snapshot;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/orders"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-border)] hover:bg-gray-50 transition-colors"
          aria-label="목록으로"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">주문 상세</h1>
          <p className="text-xs font-mono text-[var(--color-text-tertiary)]">{order.order_number}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge className={ORDER_STATUS_BADGE[order.status as OrderStatus]}>
            {ORDER_STATUS_LABEL[order.status as OrderStatus]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order items */}
          <SectionCard title="주문 상품">
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.product_snapshot.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product_snapshot.thumbnail_url}
                      alt={item.product_snapshot.name}
                      className="w-12 h-12 object-cover rounded-lg border border-[var(--color-border)] shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg border border-[var(--color-border)] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {item.product_snapshot.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {item.product_snapshot.size} / {item.product_snapshot.color} · SKU: {item.product_snapshot.sku}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {formatAmount(item.unit_price, order.currency)} × {item.quantity}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {formatAmount(item.total_price, order.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Payment summary */}
          <SectionCard title="결제 요약">
            <dl className="space-y-0">
              <InfoRow label="소계">{formatAmount(order.subtotal, order.currency)}</InfoRow>
              <InfoRow label="배송비">{formatAmount(order.shipping_fee, order.currency)}</InfoRow>
              {order.discount_amount > 0 && (
                <InfoRow label="할인">
                  <span className="text-red-500">- {formatAmount(order.discount_amount, order.currency)}</span>
                </InfoRow>
              )}
              {order.tax_amount > 0 && (
                <InfoRow label="세금">{formatAmount(order.tax_amount, order.currency)}</InfoRow>
              )}
              {order.point_used > 0 && (
                <InfoRow label="포인트 사용">
                  <span className="text-red-500">- {order.point_used.toLocaleString()}P</span>
                </InfoRow>
              )}
              <InfoRow label="최종 결제">
                <span className="text-base font-bold">{formatAmount(order.total_amount, order.currency)}</span>
              </InfoRow>
            </dl>
          </SectionCard>

          {/* Status actions */}
          <SectionCard title="상태 변경">
            <OrderStatusActions orderId={order.id} currentStatus={order.status as OrderStatus} />
          </SectionCard>

          {/* Payment info + Refund */}
          {order.payment && (
            <SectionCard title="결제 정보">
              <dl className="space-y-0 mb-4">
                <InfoRow label="결제 수단">{order.payment.method}</InfoRow>
                <InfoRow label="PG사">{order.payment.provider}</InfoRow>
                <InfoRow label="결제 상태">{order.payment.status}</InfoRow>
                <InfoRow label="결제 금액">{formatAmount(order.payment.amount, order.currency)}</InfoRow>
                {order.payment.refund_amount != null && order.payment.refund_amount > 0 && (
                  <InfoRow label="환불 금액">
                    <span className="text-red-500">{formatAmount(order.payment.refund_amount, order.currency)}</span>
                  </InfoRow>
                )}
                {order.payment.paid_at && (
                  <InfoRow label="결제일">{new Date(order.payment.paid_at).toLocaleString('ko-KR')}</InfoRow>
                )}
              </dl>
              {order.status === 'REFUND_REQUESTED' && (
                <RefundForm
                  orderId={order.id}
                  maxRefundable={order.payment.amount - (order.payment.refund_amount ?? 0)}
                  currency={order.currency}
                />
              )}
            </SectionCard>
          )}

          {/* Admin memo */}
          <SectionCard title="관리자 메모">
            <AdminMemoForm orderId={order.id} initialMemo={order.admin_memo} />
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Customer info */}
          <SectionCard title="고객 정보">
            {order.user ? (
              <dl>
                <InfoRow label="이름">{order.user.name}</InfoRow>
                <InfoRow label="이메일">{order.user.email}</InfoRow>
                {order.user.phone && <InfoRow label="전화번호">{order.user.phone}</InfoRow>}
                <InfoRow label="회원 ID">
                  <Link href={`/members/${order.user.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                    {order.user.id.slice(0, 8)}…
                  </Link>
                </InfoRow>
              </dl>
            ) : (
              <p className="text-sm text-[var(--color-text-tertiary)]">고객 정보 없음</p>
            )}
          </SectionCard>

          {/* Shipping address */}
          {addr && (
            <SectionCard title="배송지">
              <dl>
                <InfoRow label="수령인">{addr.recipient_name}</InfoRow>
                <InfoRow label="연락처">{addr.phone}</InfoRow>
                <InfoRow label="주소">
                  <div>
                    <p>{addr.postal_code}</p>
                    <p>{addr.city}, {addr.state_province ?? ''}</p>
                    <p>{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    <p>{addr.country}</p>
                  </div>
                </InfoRow>
              </dl>
            </SectionCard>
          )}

          {/* Order meta */}
          <SectionCard title="주문 정보">
            <dl>
              <InfoRow label="주문일">{new Date(order.ordered_at).toLocaleString('ko-KR')}</InfoRow>
              <InfoRow label="통화">{order.currency}</InfoRow>
              {order.memo && <InfoRow label="고객 메모">{order.memo}</InfoRow>}
              {order.cancel_reason && (
                <InfoRow label="취소 사유">
                  <span className="text-red-500">{order.cancel_reason}</span>
                </InfoRow>
              )}
              {order.return_reason && (
                <InfoRow label="반품 사유">
                  <span className="text-orange-500">{order.return_reason}</span>
                </InfoRow>
              )}
            </dl>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
