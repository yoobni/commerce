import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ShipmentStatus, ShipmentTrackingEvent } from '@commerce/types';

// ─── Aftership tag → internal ShipmentStatus ─────────────────────────────────

const AFTERSHIP_STATUS_MAP: Record<string, ShipmentStatus> = {
  Pending: 'PENDING',
  InfoReceived: 'PICKED_UP',
  InTransit: 'IN_TRANSIT',
  OutForDelivery: 'OUT_FOR_DELIVERY',
  AttemptFail: 'OUT_FOR_DELIVERY',
  Delivered: 'DELIVERED',
  Exception: 'CUSTOMS_HELD',
  Returned: 'RETURNED',
};

const STATUS_PRIORITY: Record<ShipmentStatus, number> = {
  PENDING: 0,
  PICKED_UP: 1,
  IN_TRANSIT: 2,
  CUSTOMS_HELD: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  RETURNED: 5,
};

// ─── HMAC-SHA256 signature verification ──────────────────────────────────────

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}

// ─── Aftership webhook payload types ─────────────────────────────────────────

interface AftershipCheckpoint {
  tag?: string;
  city?: string;
  message?: string;
  checkpoint_time?: string;
}

interface AftershipWebhookPayload {
  event?: string;
  msg?: {
    id?: string;
    tracking_number?: string;
    slug?: string;
    tag?: string;
    checkpoints?: AftershipCheckpoint[];
  };
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.AFTERSHIP_WEBHOOK_SECRET;
  const rawBody = await req.text();

  // Verify signature if secret is configured
  if (webhookSecret) {
    const signature = req.headers.get('x-aftership-hmac-sha256') ?? '';
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let payload: AftershipWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as AftershipWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only process tracking update events
  if (payload.event !== 'tracking_update') {
    return NextResponse.json({ ok: true });
  }

  const msg = payload.msg;
  if (!msg?.id || !msg.tag) {
    return NextResponse.json({ ok: true });
  }

  const newStatus = AFTERSHIP_STATUS_MAP[msg.tag];
  if (!newStatus) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // Find shipment by external_tracker_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: shipment } = await (supabase.from('shipments') as any)
    .select('id, order_id, status, tracking_events')
    .eq('external_tracker_id', msg.id)
    .single();

  if (!shipment) {
    return NextResponse.json({ ok: true });
  }

  const currentStatus = shipment.status as ShipmentStatus;

  // Anti-regression: skip if new status is not a progression
  if (STATUS_PRIORITY[newStatus] <= STATUS_PRIORITY[currentStatus]) {
    return NextResponse.json({ ok: true });
  }

  // Build new tracking events from checkpoints
  const newEvents: ShipmentTrackingEvent[] = (msg.checkpoints ?? [])
    .filter((c) => !!c.checkpoint_time)
    .map((c) => ({
      status: c.tag ?? '',
      location: c.city ?? null,
      message: c.message ?? null,
      occurred_at: c.checkpoint_time!,
    }))
    .reverse();

  const shipmentPatch: Record<string, unknown> = {
    status: newStatus,
    last_synced_at: now,
    tracking_events: newEvents,
    updated_at: now,
  };
  if (newStatus === 'DELIVERED') shipmentPatch.delivered_at = now;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('shipments') as any).update(shipmentPatch).eq('id', shipment.id);

  // Sync order status to DELIVERED
  if (newStatus === 'DELIVERED') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('orders') as any)
      .update({ status: 'DELIVERED', updated_at: now })
      .eq('id', shipment.order_id)
      .eq('status', 'SHIPPED');

    revalidatePath(`/orders/${shipment.order_id as string}`);
  }

  revalidatePath(`/shipping/${shipment.order_id as string}`);

  return NextResponse.json({ ok: true });
}
