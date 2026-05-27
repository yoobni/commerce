import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { OrderStatus } from '@commerce/types';
import { adminGetOrder, ORDER_STATUS_LABEL } from '@/lib/queries/orders';
import {
  Badge,
  type BadgeProps,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { OrderStatusActions } from './_components/OrderStatusActions';
import { AdminMemoForm } from './_components/AdminMemoForm';
import { RefundForm } from './_components/RefundForm';

export const metadata = { title: '주문 상세' };

const STATUS_VARIANT: Record<OrderStatus, BadgeProps['variant']> = {
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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await adminGetOrder(id);
  if (!order) notFound();

  const addr = order.shipping_address_snapshot;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/orders" aria-label="목록으로">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
            주문 상세
          </h1>
          <p className="mt-0.5 font-mono text-[12px] text-muted-foreground">{order.order_number}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={STATUS_VARIANT[order.status as OrderStatus]}>
            {ORDER_STATUS_LABEL[order.status as OrderStatus]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Order items */}
          <Section title="주문 상품">
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.product_snapshot.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product_snapshot.thumbnail_url}
                      alt={item.product_snapshot.name}
                      className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-md border border-border bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {item.product_snapshot.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.product_snapshot.size} / {item.product_snapshot.color} · SKU:{' '}
                      <span className="font-mono">{item.product_snapshot.sku}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[13px] font-medium text-foreground">
                      {formatAmount(item.unit_price, order.currency)} × {item.quantity}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      = {formatAmount(item.total_price, order.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Payment summary */}
          <Section title="결제 요약">
            <dl>
              <InfoRow label="소계">{formatAmount(order.subtotal, order.currency)}</InfoRow>
              <InfoRow label="배송비">{formatAmount(order.shipping_fee, order.currency)}</InfoRow>
              {order.discount_amount > 0 && (
                <InfoRow label="할인">
                  <span className="text-destructive">
                    − {formatAmount(order.discount_amount, order.currency)}
                  </span>
                </InfoRow>
              )}
              {order.tax_amount > 0 && (
                <InfoRow label="세금">{formatAmount(order.tax_amount, order.currency)}</InfoRow>
              )}
              {order.point_used > 0 && (
                <InfoRow label="포인트 사용">
                  <span className="text-destructive">− {order.point_used.toLocaleString()}P</span>
                </InfoRow>
              )}
              <InfoRow label="최종 결제">
                <span className="font-mono text-base font-semibold">
                  {formatAmount(order.total_amount, order.currency)}
                </span>
              </InfoRow>
            </dl>
          </Section>

          {/* Status actions */}
          <Section title="상태 변경">
            <OrderStatusActions orderId={order.id} currentStatus={order.status as OrderStatus} />
          </Section>

          {/* Payment info + Refund */}
          {order.payment && (
            <Section title="결제 정보">
              <dl className="mb-4">
                <InfoRow label="결제 수단">{order.payment.method}</InfoRow>
                <InfoRow label="PG사">{order.payment.provider}</InfoRow>
                <InfoRow label="결제 상태">{order.payment.status}</InfoRow>
                <InfoRow label="결제 금액">
                  {formatAmount(order.payment.amount, order.currency)}
                </InfoRow>
                {order.payment.refund_amount != null && order.payment.refund_amount > 0 && (
                  <InfoRow label="환불 금액">
                    <span className="text-destructive">
                      {formatAmount(order.payment.refund_amount, order.currency)}
                    </span>
                  </InfoRow>
                )}
                {order.payment.paid_at && (
                  <InfoRow label="결제일">
                    {new Date(order.payment.paid_at).toLocaleString('ko-KR')}
                  </InfoRow>
                )}
              </dl>
              {order.status === 'REFUND_REQUESTED' && (
                <RefundForm
                  orderId={order.id}
                  maxRefundable={order.payment.amount - (order.payment.refund_amount ?? 0)}
                  currency={order.currency}
                />
              )}
            </Section>
          )}

          {/* Admin memo */}
          <Section title="관리자 메모">
            <AdminMemoForm orderId={order.id} initialMemo={order.admin_memo} />
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Customer */}
          <Section title="고객 정보">
            {order.user ? (
              <dl>
                <InfoRow label="이름">{order.user.name}</InfoRow>
                <InfoRow label="이메일">{order.user.email}</InfoRow>
                {order.user.phone && <InfoRow label="전화번호">{order.user.phone}</InfoRow>}
                <InfoRow label="회원 ID">
                  <Link
                    href={`/members/${order.user.id}`}
                    className="font-mono text-[12px] text-[var(--mz-accent)] hover:underline"
                  >
                    {order.user.id.slice(0, 8)}…
                  </Link>
                </InfoRow>
              </dl>
            ) : (
              <p className="text-[13px] text-muted-foreground">고객 정보 없음</p>
            )}
          </Section>

          {/* Shipping address */}
          {addr && (
            <Section title="배송지">
              <dl>
                <InfoRow label="수령인">{addr.recipient_name}</InfoRow>
                <InfoRow label="연락처">{addr.phone}</InfoRow>
                <InfoRow label="주소">
                  <div className="space-y-0.5">
                    <p className="font-mono text-[12px]">{addr.postal_code}</p>
                    <p>
                      {addr.city}
                      {addr.state_province ? `, ${addr.state_province}` : ''}
                    </p>
                    <p>{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    <p className="text-muted-foreground">{addr.country}</p>
                  </div>
                </InfoRow>
              </dl>
            </Section>
          )}

          {/* Order meta */}
          <Section title="주문 정보">
            <dl>
              <InfoRow label="주문일">
                {new Date(order.ordered_at).toLocaleString('ko-KR')}
              </InfoRow>
              <InfoRow label="통화">{order.currency}</InfoRow>
              {order.memo && <InfoRow label="고객 메모">{order.memo}</InfoRow>}
              {order.cancel_reason && (
                <InfoRow label="취소 사유">
                  <span className="text-destructive">{order.cancel_reason}</span>
                </InfoRow>
              )}
              {order.return_reason && (
                <InfoRow label="반품 사유">
                  <span className="text-[var(--mz-accent)]">{order.return_reason}</span>
                </InfoRow>
              )}
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
