'use server';

// ─── 배송 추적 외부 API 연동 계획 ─────────────────────────────────────────────
// docs/shipping-tracking-plan.md 참고
//
// [나중에 구현] startShipment() 안에서 외부 Tracker 생성 호출 필요:
//   1. apps/admin/src/lib/services/tracking.ts 신규 작성 (외부 API 래퍼)
//   2. startShipment() 내 upsert 직후 → createExternalTracker(carrier, trackingNumber) 호출
//   3. 반환된 external_tracker_id를 shipments 레코드에 저장
//   4. Webhook 수신: apps/commerce/src/app/api/webhooks/tracking/route.ts 신규 작성
//   5. Polling 배치: apps/admin/src/app/api/cron/sync-shipments/route.ts 신규 작성
//
// 상태 매핑 테이블: docs/shipping-tracking-plan.md § 4
// DB 마이그레이션: supabase/migrations/YYYYMMDD_add_tracking_fields.sql (external_tracker_id, last_synced_at)
// ─────────────────────────────────────────────────────────────────────────────

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { getSession } from '@/lib/auth/session';
import type { Carrier, Country, ShipmentStatus } from '@commerce/types';

// ─── Input invoice & start shipment ──────────────────────────────────────────

export interface StartShipmentInput {
  orderId: string;
  carrier: Carrier;
  trackingNumber: string;
  country: string;
}

export async function startShipment(input: StartShipmentInput): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const { orderId, carrier, trackingNumber, country } = input;
  if (!trackingNumber.trim()) throw new Error('운송장 번호를 입력해주세요.');

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // Upsert shipment record
  // [나중에 구현] upsert 직후 아래 로직 추가:
  //   const tracker = await createExternalTracker(carrier, trackingNumber);
  //   → external_tracker_id: tracker.id, last_synced_at: now 도 함께 저장
  //   참고: apps/admin/src/lib/services/tracking.ts § createExternalTracker()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: shipError } = await (supabase.from('shipments') as any).upsert(
    {
      order_id: orderId,
      carrier,
      tracking_number: trackingNumber.trim(),
      country,
      status: 'PENDING',
      shipped_at: now,
      updated_at: now,
    },
    { onConflict: 'order_id' }
  );
  if (shipError) throw shipError;

  // Advance order to SHIPPED
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: orderError } = await (supabase.from('orders') as any)
    .update({ status: 'SHIPPED', updated_at: now })
    .eq('id', orderId)
    .eq('status', 'PREPARING');
  if (orderError) throw orderError;

  revalidatePath(`/shipping/${orderId}`);
  revalidatePath('/shipping');
}

// ─── Update shipment status ───────────────────────────────────────────────────

const SHIPMENT_TRANSITIONS: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
  PENDING: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['CUSTOMS_HELD', 'OUT_FOR_DELIVERY'],
  CUSTOMS_HELD: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
  DELIVERED: [],
  RETURNED: [],
};

export async function updateShipmentStatus(
  shipmentId: string,
  newStatus: ShipmentStatus
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current, error: fetchError } = await (supabase.from('shipments') as any)
    .select('status, order_id')
    .eq('id', shipmentId)
    .single();
  if (fetchError || !current) throw new Error('배송 정보를 찾을 수 없습니다.');

  const allowed = SHIPMENT_TRANSITIONS[current.status as ShipmentStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`상태 전이 불가: ${current.status} → ${newStatus}`);
  }

  const now = new Date().toISOString();
  const patch: Record<string, string> = { status: newStatus, updated_at: now };
  if (newStatus === 'DELIVERED') patch.delivered_at = now;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('shipments') as any)
    .update(patch)
    .eq('id', shipmentId);
  if (error) throw error;

  revalidatePath(`/shipping/${current.order_id}`);
  revalidatePath('/shipping');
}

// ─── Set return tracking number ───────────────────────────────────────────────

export async function setReturnTracking(
  shipmentId: string,
  returnTrackingNumber: string
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current, error: fetchError } = await (supabase.from('shipments') as any)
    .select('order_id')
    .eq('id', shipmentId)
    .single();
  if (fetchError || !current) throw new Error('배송 정보를 찾을 수 없습니다.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('shipments') as any)
    .update({
      return_tracking_number: returnTrackingNumber.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', shipmentId);
  if (error) throw error;

  revalidatePath(`/shipping/${current.order_id}`);
}
