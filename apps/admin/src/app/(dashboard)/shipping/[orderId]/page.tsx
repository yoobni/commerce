import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import type { OrderStatus, ShipmentStatus } from '@commerce/types';
import {
  adminGetShippingOrder,
  CARRIER_LABEL,
  SHIPMENT_STATUS_LABEL,
  SHIPMENT_STATUS_VARIANT,
} from '@/lib/queries/shipments';
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from '@/lib/queries/orders';
import {
  Badge,
  Button,
  InfoRow,
  InfoSection,
  PageHeader,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { ShipmentInputForm } from './_components/ShipmentInputForm';
import { ShipmentStatusUpdater } from './_components/ShipmentStatusUpdater';

export const metadata = { title: '배송 상세' };

// Timeline step order
const TIMELINE: ShipmentStatus[] = [
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

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
    <div className="mx-auto max-w-6xl">
      <div className="mb-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/shipping">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> 배송 목록
          </Link>
        </Button>
      </div>

      <PageHeader
        title={<span className="font-mono">{order.order_number}</span>}
        description={order.user?.name ?? '—'}
        actions={
          <Badge variant={ORDER_STATUS_VARIANT[order.status as OrderStatus]}>
            {ORDER_STATUS_LABEL[order.status as OrderStatus]}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          {shipment && (
            <InfoSection
              title="배송 추적"
              actions={
                <Badge variant={SHIPMENT_STATUS_VARIANT[shipment.status as ShipmentStatus]}>
                  {SHIPMENT_STATUS_LABEL[shipment.status as ShipmentStatus]}
                </Badge>
              }
            >
              <div className="mb-5 flex items-center gap-3 text-[12.5px]">
                <span className="text-muted-foreground">택배사</span>
                <span className="font-medium text-foreground">
                  {CARRIER_LABEL[shipment.carrier] ?? shipment.carrier}
                </span>
                <span className="mx-2 h-3 w-px bg-border" aria-hidden="true" />
                <span className="text-muted-foreground">운송장</span>
                <span className="font-mono font-medium text-foreground">
                  {shipment.tracking_number}
                </span>
              </div>

              {/* Step timeline */}
              <ol className="relative flex items-start">
                {/* Track line */}
                <div
                  className="absolute left-0 right-0 top-[14px] h-0.5 bg-border"
                  aria-hidden="true"
                />
                {/* Progress line */}
                {currentStepIndex > 0 && (
                  <div
                    className="absolute left-0 top-[14px] h-0.5 bg-[var(--mz-accent)] transition-all"
                    style={{
                      width: `${(currentStepIndex / (TIMELINE.length - 1)) * 100}%`,
                    }}
                    aria-hidden="true"
                  />
                )}
                {TIMELINE.map((step, idx) => {
                  const done = idx < currentStepIndex;
                  const active = idx === currentStepIndex;
                  return (
                    <li
                      key={step}
                      className="relative z-10 flex flex-1 flex-col items-center gap-1.5"
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors',
                          active &&
                            'border-[var(--mz-accent)] bg-[var(--mz-accent)] text-white',
                          done && 'border-[var(--mz-accent)] bg-[var(--mz-accent)] text-white',
                          !active &&
                            !done &&
                            'border-border bg-card text-muted-foreground',
                        )}
                      >
                        {done ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : (
                          <span className="text-[10.5px] font-semibold">{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-center text-[11px]',
                          active && 'font-semibold text-foreground',
                          done && 'text-foreground',
                          !active && !done && 'text-muted-foreground',
                        )}
                      >
                        {SHIPMENT_STATUS_LABEL[step]}
                      </span>
                    </li>
                  );
                })}
              </ol>

              <dl className="mt-6 border-t border-border pt-4">
                {shipment.shipped_at && (
                  <InfoRow label="발송 일시">
                    {new Date(shipment.shipped_at).toLocaleString('ko-KR')}
                  </InfoRow>
                )}
                {shipment.estimated_delivery_at && (
                  <InfoRow label="예상 도착">
                    {new Date(shipment.estimated_delivery_at).toLocaleDateString('ko-KR')}
                  </InfoRow>
                )}
                {shipment.delivered_at && (
                  <InfoRow label="배달 완료">
                    {new Date(shipment.delivered_at).toLocaleString('ko-KR')}
                  </InfoRow>
                )}
                {shipment.return_tracking_number && (
                  <InfoRow label="반송 운송장">
                    <span className="font-mono">{shipment.return_tracking_number}</span>
                  </InfoRow>
                )}
              </dl>
            </InfoSection>
          )}

          <InfoSection title={`주문 상품 · ${order.items.length}개`}>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.product_snapshot.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product_snapshot.thumbnail_url}
                      alt={item.product_snapshot.name}
                      className="h-10 w-10 shrink-0 rounded border border-border object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded border border-border bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {item.product_snapshot.name}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {item.product_snapshot.sku}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[12.5px] text-muted-foreground">
                      {item.product_snapshot.size} / {item.product_snapshot.color}
                    </p>
                    <p className="font-mono text-[13px] font-medium text-foreground">
                      × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </InfoSection>

          {addr && (
            <InfoSection title="배송지">
              <dl>
                <InfoRow label="수령인">{addr.recipient_name}</InfoRow>
                <InfoRow label="연락처">{addr.phone}</InfoRow>
                <InfoRow label="국가">{addr.country}</InfoRow>
                <InfoRow label="주소">
                  <div className="space-y-0.5">
                    <p className="font-mono text-[12px]">{addr.postal_code}</p>
                    <p>
                      {addr.city}
                      {addr.state_province ? `, ${addr.state_province}` : ''}
                    </p>
                    <p>{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                  </div>
                </InfoRow>
              </dl>
            </InfoSection>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {order.status === 'PREPARING' && !shipment && (
            <InfoSection title="송장 입력">
              <ShipmentInputForm orderId={order.id} country={addr?.country ?? 'KR'} />
            </InfoSection>
          )}

          {shipment && order.status === 'SHIPPED' && (
            <InfoSection title="배송 상태 관리">
              <ShipmentStatusUpdater
                shipmentId={shipment.id}
                currentStatus={shipment.status as ShipmentStatus}
              />
            </InfoSection>
          )}

          {order.user && (
            <InfoSection title="고객 정보">
              <dl>
                <InfoRow label="이름">{order.user.name}</InfoRow>
                <InfoRow label="이메일">
                  <span className="break-all text-[12px]">{order.user.email}</span>
                </InfoRow>
                {order.user.phone && <InfoRow label="전화">{order.user.phone}</InfoRow>}
              </dl>
            </InfoSection>
          )}

          <Button variant="outline" size="md" asChild className="w-full">
            <Link href={`/orders/${order.id}`}>전체 주문 보기 →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
