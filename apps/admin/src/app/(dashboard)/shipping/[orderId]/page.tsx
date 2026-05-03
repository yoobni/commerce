import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Carrier, ShipmentStatus } from '@commerce/types';
import { adminGetShippingOrder } from '@/lib/queries/shipments';
import { ShipmentInputForm } from './_components/ShipmentInputForm';
import { ShipmentStatusUpdater } from './_components/ShipmentStatusUpdater';

import { TrackingEventsTimeline } from './_components/TrackingEventsTimeline';
import { SyncShipmentButton } from './_components/SyncShipmentButton';

// ─── Labels ───────────────────────────────────────────────────────────────────

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

const SHIPMENT_STATUS_BADGE: Record<ShipmentStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-500',
  PICKED_UP: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-violet-100 text-violet-700',
  CUSTOMS_HELD: 'bg-orange-100 text-orange-700',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  RETURNED: 'bg-red-100 text-red-700',
};

// Timeline step order
const TIMELINE: ShipmentStatus[] = [
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function ShippingDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  const order = await adminGetShippingOrder(orderId);
  if (!order) notFound();

  const shipment = order.shipment;
  const addr = order.shipping_address_snapshot;
  const currentStepIndex = shipment ? TIMELINE.indexOf(shipment.status as ShipmentStatus) : -1;

  return (
    <div className="max-w-5xl">
      <Link
        href="/shipping"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        ← 배송 목록
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)] font-mono">
          {order.order_number}
        </h1>
        <span className="px-2.5 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-700">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Main ── */}
        <div className="col-span-2 space-y-6">
          {/* Shipment timeline */}
          {shipment && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="font-medium text-[var(--color-text-primary)] mb-4">배송 추적</h2>

              <div className="flex items-center gap-2 mb-5">
                <span className="text-sm text-[var(--color-text-secondary)]">택배사:</span>
                <span className="text-sm font-medium">
                  {CARRIER_LABEL[shipment.carrier] ?? shipment.carrier}
                </span>
                <span className="text-sm text-[var(--color-text-secondary)] ml-2">운송장:</span>
                <span className="font-mono text-sm font-medium">{shipment.tracking_number}</span>
                <span
                  className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${SHIPMENT_STATUS_BADGE[shipment.status as ShipmentStatus]}`}
                >
                  {SHIPMENT_STATUS_LABEL[shipment.status as ShipmentStatus]}
                </span>
              </div>

              {/* Step timeline */}
              <ol className="flex items-center">
                {TIMELINE.map((step, idx) => {
                  const done = idx <= currentStepIndex;
                  const active = idx === currentStepIndex;
                  return (
                    <li key={step} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                          active
                            ? 'border-violet-600 bg-violet-600 text-white'
                            : done
                              ? 'border-violet-300 bg-violet-100 text-violet-600'
                              : 'border-gray-200 bg-gray-50 text-gray-300'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`text-xs text-center ${
                          active
                            ? 'text-violet-700 font-semibold'
                            : done
                              ? 'text-violet-500'
                              : 'text-gray-400'
                        }`}
                      >
                        {SHIPMENT_STATUS_LABEL[step]}
                      </span>
                      {idx < TIMELINE.length - 1 && (
                        <div
                          className={`absolute h-0.5 w-full top-3.5 left-1/2 ${
                            done ? 'bg-violet-300' : 'bg-gray-200'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  );
                })}
              </ol>

              {/* Tracking events from external API */}
              {shipment.tracking_events && shipment.tracking_events.length > 0 && (
                <div className="mt-5 border-t border-[var(--color-border)] pt-4">
                  <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wide">
                    배송 이력
                  </h3>
                  <TrackingEventsTimeline events={shipment.tracking_events} />
                </div>
              )}

              {/* Timestamps */}
              <dl className="mt-5 space-y-2 text-sm border-t border-[var(--color-border)] pt-4">
                {shipment.shipped_at && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">발송 일시</dt>
                    <dd className="text-[var(--color-text-primary)]">
                      {new Date(shipment.shipped_at).toLocaleString('ko-KR')}
                    </dd>
                  </div>
                )}
                {shipment.estimated_delivery_at && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">예상 도착</dt>
                    <dd className="text-[var(--color-text-primary)]">
                      {new Date(shipment.estimated_delivery_at).toLocaleDateString('ko-KR')}
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
                    <dd className="font-mono text-[var(--color-text-primary)]">
                      {shipment.return_tracking_number}
                    </dd>
                  </div>
                )}
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
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                    상품
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                    옵션
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                    수량
                  </th>
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
                  </tr>
                ))}
              </tbody>
            </table>
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
                    {[
                      addr.postal_code,
                      addr.state_province,
                      addr.city,
                      addr.address_line1,
                      addr.address_line2,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="col-span-1 space-y-4">
          {/* Invoice input (PREPARING) */}
          {order.status === 'PREPARING' && !shipment && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="font-medium text-[var(--color-text-primary)] mb-4">송장 입력</h2>
              <ShipmentInputForm orderId={order.id} country={addr?.country ?? 'KR'} />
            </div>
          )}

          {/* Status update (SHIPPED) */}
          {shipment && order.status === 'SHIPPED' && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="font-medium text-[var(--color-text-primary)] mb-4">배송 상태 관리</h2>
              <ShipmentStatusUpdater
                shipmentId={shipment.id}
                currentStatus={shipment.status as ShipmentStatus}
              />
            </div>
          )}

          {/* External sync */}
          {shipment && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="font-medium text-[var(--color-text-primary)] mb-3">외부 추적 동기화</h2>
              <SyncShipmentButton
                shipmentId={shipment.id}
                hasExternalTracker={!!shipment.external_tracker_id}
                lastSyncedAt={shipment.last_synced_at ?? null}
              />
            </div>
          )}

          {/* Customer info */}
          {order.user && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="font-medium text-[var(--color-text-primary)] mb-3">고객 정보</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">이름</dt>
                  <dd className="text-[var(--color-text-primary)]">{order.user.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-secondary)]">이메일</dt>
                  <dd className="text-[var(--color-text-primary)] text-xs">{order.user.email}</dd>
                </div>
                {order.user.phone && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">전화</dt>
                    <dd className="text-[var(--color-text-primary)]">{order.user.phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Link to full order */}
          <Link
            href={`/orders/${order.id}`}
            className="block w-full py-2.5 text-center text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl hover:bg-gray-50 transition-colors"
          >
            전체 주문 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
