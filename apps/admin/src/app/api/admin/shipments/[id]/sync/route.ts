import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { createServiceClient } from '@/lib/supabase/service';
import { fetchTrackerStatus, isStatusProgression } from '@/lib/services/tracking';
import type { ShipmentStatus } from '@commerce/types';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: shipmentId } = await params;
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: shipment, error } = await (supabase.from('shipments') as any)
    .select('id, order_id, status, external_tracker_id')
    .eq('id', shipmentId)
    .single();

  if (error || !shipment) {
    return NextResponse.json({ error: '배송 정보를 찾을 수 없습니다.' }, { status: 404 });
  }

  if (!shipment.external_tracker_id) {
    return NextResponse.json({ error: '외부 Tracker가 등록되지 않았습니다. (AFTERSHIP_API_KEY 미설정)' }, { status: 422 });
  }

  const result = await fetchTrackerStatus(shipment.external_tracker_id as string);
  if (!result) {
    return NextResponse.json({ error: '외부 API 조회 실패' }, { status: 502 });
  }

  const now = new Date().toISOString();
  const currentStatus = shipment.status as ShipmentStatus;
  const shouldUpdateStatus = isStatusProgression(currentStatus, result.status);

  const patch: Record<string, unknown> = {
    last_synced_at: now,
    tracking_events: result.events,
    updated_at: now,
  };

  if (shouldUpdateStatus) {
    patch.status = result.status;
    if (result.status === 'DELIVERED') patch.delivered_at = now;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('shipments') as any).update(patch).eq('id', shipmentId);

  if (shouldUpdateStatus && result.status === 'DELIVERED') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('orders') as any)
      .update({ status: 'DELIVERED', updated_at: now })
      .eq('id', shipment.order_id)
      .eq('status', 'SHIPPED');

    revalidatePath(`/orders/${shipment.order_id as string}`);
  }

  revalidatePath(`/shipping/${shipment.order_id as string}`);

  return NextResponse.json({
    status: shouldUpdateStatus ? result.status : currentStatus,
    events: result.events.length,
    updated: shouldUpdateStatus,
  });
}
