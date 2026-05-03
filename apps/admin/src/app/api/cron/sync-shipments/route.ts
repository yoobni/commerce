import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { fetchTrackerStatus, isStatusProgression } from '@/lib/services/tracking';
import type { ShipmentStatus } from '@commerce/types';

const SYNC_TARGET_STATUSES: ShipmentStatus[] = [
  'PICKED_UP',
  'IN_TRANSIT',
  'CUSTOMS_HELD',
  'OUT_FOR_DELIVERY',
];

export async function GET(req: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = createServiceClient();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  // Fetch stale in-transit shipments that have an external tracker
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: shipments } = await (supabase.from('shipments') as any)
    .select('id, order_id, status, external_tracker_id')
    .in('status', SYNC_TARGET_STATUSES)
    .not('external_tracker_id', 'is', null)
    .is('delivered_at', null)
    .or(`last_synced_at.is.null,last_synced_at.lt.${twoHoursAgo}`)
    .limit(50);

  if (!shipments?.length) {
    return NextResponse.json({ synced: 0 });
  }

  let synced = 0;

  for (const shipment of shipments as {
    id: string;
    order_id: string;
    status: string;
    external_tracker_id: string;
  }[]) {
    const result = await fetchTrackerStatus(shipment.external_tracker_id);
    if (!result) continue;

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
    await (supabase.from('shipments') as any).update(patch).eq('id', shipment.id);

    if (shouldUpdateStatus && result.status === 'DELIVERED') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('orders') as any)
        .update({ status: 'DELIVERED', updated_at: now })
        .eq('id', shipment.order_id)
        .eq('status', 'SHIPPED');

      revalidatePath(`/orders/${shipment.order_id}`);
    }

    revalidatePath(`/shipping/${shipment.order_id}`);
    synced++;
  }

  return NextResponse.json({ synced, total: shipments.length });
}
