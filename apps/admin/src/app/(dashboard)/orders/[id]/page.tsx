import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { OrderStatus, PaymentMethod, PaymentStatus, Carrier, ShipmentStatus } from '@commerce/types';
import { adminGetOrder } from '@/lib/queries/orders';
import { OrderStatusButton } from './_components/OrderStatusButton';
import { ShipmentForm } from './_components/ShipmentForm';
import { RefundForm } from './_components/RefundForm';
import { AdminMemoForm } from './_components/AdminMemoForm';
import {
  confirmPayment,
  markDelivered,
  confirmOrder,
  completeReturn,
  cancelOrder,
} from '@/lib/actions/orders';

// ─── Labels ───────────────────────────────────────────────────────────────────

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

const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-gray-100 text-gray-500',
  PAID: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-teal-100 text-teal-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-700',
  RETURNED: 'bg-orange-100 text-orange-600',
  REFUND_REQUESTED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-red-100 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-500',
  DELIVERY_FAILED: 'bg-red-100 text-red-800',
};

const PAYMENT_METHOD_LABEL: Partial<Record<PaymentMethod, string>> = {
  CARD: '카드',
  KAKAO_PAY: '카카오페이',
  NAVER_PAY: '네이버페이',
  TOSS_PAY: '토스페이',
  STRIPE: 'Stripe',
  KLARNA: 'Klarna',
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: '대기',
  PAID: '결제 완료',
  FAILED: '실패',
  CANCELLED: '취소',
  PARTIALLY_REFUNDED: '부분 환불',
  FULLY_REFUNDED: '전액 환불',
};

const CARRIER_LABEL: Partial<Record<Carrier, string>> = {
  CJ: 'CJ대한통운',
  HANJIN: '한진택배',
  LOGEN: '로젠택배',
  EMS: 'EMS',
  DHL: 'DHL',
  FEDEX: 'FedEx',
  UPS: 'UPS',
  USPS: 'USPS',
  YAMATO: '야마토',
  SAGAWA: '사가와',
};

const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  PENDING: '대기',
  PICKED_UP: '수거 완료',
  IN_TRANSIT: '배송 중',
  CUSTOMS_HELD: '통관 보류',
  OUT_FOR_DELIVERY: '배달 중',
  DELIVERED: '배달 완료',
  RETURNED: '반송',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await adminGetOrder(id);
  if (!order) notFound();

  // Normalize 1:1 relations that may come as arrays depending on Supabase version
  const payment = Array.isArray(order.payment)
    ? (order.payment[0] ?? null)
    : (order.payment ?? null);
  const shipment = Array.isArray(order.shipment)
    ? (order.shipment[0] ?? null)
    : (order.shipment ?? null);

  const addr = order.shipping_address_snapshot;

  return (
    <div className="max-w-6xl">
      {/* Back */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        ← 주문 목록
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)] font-mono">
          {order.order_number}
        </h1>
        <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${ORDER_STATUS_BADGE[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Left/Main (col-span-2) ── */}
        <div className="col-span-2 space-y-6">
          {/* Order summary */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="font-medium text-[var(--color-text-primary)] mb-4">주문 정보</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex justify-between col-span-1">
                <dt className="text-[var(--color-text-secondary)]">주문일시</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {new Date(order.ordered_at).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div className="flex justify-between col-span-1">
                <dt className="text-[var(--color-text-secondary)]">통화</dt>
                <dd className="text-[var(--color-text-primary)]">{order.currency}</dd>
              </div>
              <div className="flex justify-between col-span-1">
                <dt className="text-[var(--color-text-secondary)]">소계</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {order.subtotal.toLocaleString()} {order.currency}
                </dd>
              </div>
              <div className="flex justify-between col-span-1">
                <dt className="text-[var(--color-text-secondary)]">배송비</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {order.shipping_fee.toLocaleString()} {order.currency}
                </dd>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between col-span-1">
                  <dt className="text-[var(--color-text-secondary)]">할인</dt>
                  <dd className="text-red-600">
                    -{order.discount_amount.toLocaleString()} {order.currency}
                  </dd>
                </div>
              )}
              {order.point_used > 0 && (
                <div className="flex justify-between col-span-1">
                  <dt className="text-[var(--color-text-secondary)]">포인트 사용</dt>
                  <dd className="text-red-600">-{order.point_used.toLocaleString()}P</dd>
                </div>
              )}
              <div className="flex justify-between col-span-2 pt-2 border-t border-[var(--color-border)] font-semibold">
                <dt className="text-[var(--color-text-primary)]">최종 결제금액</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {order.total_amount.toLocaleString()} {order.currency}
                </dd>
              </div>
            </dl>
          </div>

          {/* Customer */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="font-medium text-[var(--color-text-primary)] mb-4">고객 정보</h2>
            <dl className="space-y-2 text-sm">
              {order.user ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">이름</dt>
                    <dd>
                      <Link
                        href={`/members/${order.user.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {order.user.name}
                      </Link>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">이메일</dt>
                    <dd className="text-[var(--color-text-primary)]">{order.user.email}</dd>
                  </div>
                  {order.user.phone && (
                    <div className="flex justify-between">
                      <dt className="text-[var(--color-text-secondary)]">전화번호</dt>
                      <dd className="text-[var(--color-text-primary)]">{order.user.phone}</dd>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[var(--color-text-tertiary)]">고객 정보 없음</p>
              )}
            </dl>
          </div>

          {/* Shipping address */}
          {addr && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="font-medium text-[var(--color-text-primary)] mb-4">배송지</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">수령인</dt>
                  <dd className="text-[var(--color-text-primary)]">{addr.recipient_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">연락처</dt>
                  <dd className="text-[var(--color-text-primary)]">{addr.phone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">국가</dt>
                  <dd className="text-[var(--color-text-primary)]">{addr.country}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">주소</dt>
                  <dd className="text-[var(--color-text-primary)] text-right max-w-[280px]">
                    {[addr.postal_code, addr.state_province, addr.city, addr.address_line1, addr.address_line2]
                      .filter(Boolean)
                      .join(', ')}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Order items */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="font-medium text-[var(--color-text-primary)]">
                주문 상품 ({order.items.length}개)
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상품</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">옵션</th>
                  <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">수량</th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">금액</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.product_snapshot.thumbnail_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.product_snapshot.thumbnail_url}
                            alt={item.product_snapshot.name}
                            className="w-10 h-10 object-cover rounded border border-[var(--color-border)]"
                          />
                        )}
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">
                            {item.product_snapshot.name}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                            {item.product_snapshot.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {item.product_snapshot.size} / {item.product_snapshot.color}
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--color-text-primary)]">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-text-primary)]">
                      {item.total_price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] text-xs">
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment */}
          {payment && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="font-medium text-[var(--color-text-primary)] mb-4">결제 정보</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">결제 상태</dt>
                  <dd>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {PAYMENT_STATUS_LABEL[payment.status]}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">결제 수단</dt>
                  <dd className="text-[var(--color-text-primary)]">
                    {PAYMENT_METHOD_LABEL[payment.method] ?? payment.method}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">PG사</dt>
                  <dd className="text-[var(--color-text-primary)]">{payment.provider}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">결제 키</dt>
                  <dd className="font-mono text-xs text-[var(--color-text-secondary)] truncate max-w-[180px]">
                    {payment.payment_key}
                  </dd>
                </div>
                {payment.paid_at && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">결제 일시</dt>
                    <dd className="text-[var(--color-text-primary)]">
                      {new Date(payment.paid_at).toLocaleString('ko-KR')}
                    </dd>
                  </div>
                )}
                {payment.refund_amount != null && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">환불 금액</dt>
                    <dd className="text-red-600">
                      {payment.refund_amount.toLocaleString()} {payment.currency}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Shipment */}
          {shipment && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="font-medium text-[var(--color-text-primary)] mb-4">배송 정보</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">배송 상태</dt>
                  <dd>
                    <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-xs font-medium">
                      {SHIPMENT_STATUS_LABEL[shipment.status]}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">택배사</dt>
                  <dd className="text-[var(--color-text-primary)]">
                    {CARRIER_LABEL[shipment.carrier] ?? shipment.carrier}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">운송장 번호</dt>
                  <dd className="font-mono text-xs text-[var(--color-text-primary)]">
                    {shipment.tracking_number}
                  </dd>
                </div>
                {shipment.shipped_at && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">발송일시</dt>
                    <dd className="text-[var(--color-text-primary)]">
                      {new Date(shipment.shipped_at).toLocaleString('ko-KR')}
                    </dd>
                  </div>
                )}
                {shipment.delivered_at && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">배달 완료</dt>
                    <dd className="text-[var(--color-text-primary)]">
                      {new Date(shipment.delivered_at).toLocaleString('ko-KR')}
                    </dd>
                  </div>
                )}
                {shipment.return_tracking_number && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">반송 운송장</dt>
                    <dd className="font-mono text-xs text-[var(--color-text-primary)]">
                      {shipment.return_tracking_number}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="col-span-1 space-y-4">
          {/* Status actions */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="font-medium text-[var(--color-text-primary)] mb-4">상태 변경</h2>
            <div className="space-y-2">
              {order.status === 'PAID' && (
                <>
                  <OrderStatusButton
                    label="배송 준비로 변경"
                    confirmMessage="결제 확인 후 배송 준비 상태로 변경하시겠습니까?"
                    action={confirmPayment.bind(null, order.id)}
                    variant="primary"
                  />
                  <OrderStatusButton
                    label="주문 취소"
                    confirmMessage="주문을 취소하시겠습니까? 결제 취소 처리가 필요합니다."
                    action={cancelOrder.bind(null, order.id)}
                    variant="danger"
                  />
                </>
              )}

              {order.status === 'PREPARING' && (
                <>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                    운송장 등록 후 배송 처리됩니다.
                  </p>
                  <ShipmentForm
                    orderId={order.id}
                    country={order.shipping_address_snapshot?.country ?? 'KR'}
                  />
                  <div className="pt-2">
                    <OrderStatusButton
                      label="주문 취소"
                      confirmMessage="주문을 취소하시겠습니까?"
                      action={cancelOrder.bind(null, order.id)}
                      variant="danger"
                    />
                  </div>
                </>
              )}

              {order.status === 'SHIPPED' && (
                <OrderStatusButton
                  label="배송 완료 처리"
                  confirmMessage="배송이 완료된 것으로 처리하시겠습니까?"
                  action={markDelivered.bind(null, order.id)}
                  variant="primary"
                />
              )}

              {order.status === 'DELIVERED' && (
                <OrderStatusButton
                  label="구매 확정"
                  confirmMessage="구매 확정 처리하시겠습니까?"
                  action={confirmOrder.bind(null, order.id)}
                  variant="primary"
                />
              )}

              {order.status === 'RETURN_REQUESTED' && (
                <OrderStatusButton
                  label="반품 완료 처리"
                  confirmMessage="반품 완료로 처리하시겠습니까?"
                  action={completeReturn.bind(null, order.id)}
                  variant="warning"
                />
              )}

              {(order.status === 'RETURNED' || order.status === 'REFUND_REQUESTED') && (
                <RefundForm
                  orderId={order.id}
                  defaultAmount={order.total_amount}
                  currency={order.currency}
                />
              )}

              {['CONFIRMED', 'REFUNDED', 'CANCELLED', 'DELIVERY_FAILED', 'PENDING_PAYMENT'].includes(
                order.status
              ) && (
                <p className="text-sm text-[var(--color-text-tertiary)] text-center py-2">
                  변경 가능한 상태가 없습니다.
                </p>
              )}
            </div>
          </div>

          {/* Admin memo */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="font-medium text-[var(--color-text-primary)] mb-3">어드민 메모</h2>
            <AdminMemoForm orderId={order.id} defaultMemo={order.admin_memo} />
          </div>

          {/* Customer memo */}
          {order.memo && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="font-medium text-[var(--color-text-primary)] mb-2">고객 메모</h2>
              <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">
                {order.memo}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="font-medium text-[var(--color-text-primary)] mb-3">타임스탬프</h2>
            <dl className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              <div className="flex justify-between">
                <dt>주문</dt>
                <dd>{new Date(order.ordered_at).toLocaleString('ko-KR')}</dd>
              </div>
              <div className="flex justify-between">
                <dt>생성</dt>
                <dd>{new Date(order.created_at).toLocaleString('ko-KR')}</dd>
              </div>
              <div className="flex justify-between">
                <dt>수정</dt>
                <dd>{new Date(order.updated_at).toLocaleString('ko-KR')}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
