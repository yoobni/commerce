import type { Carrier, ShipmentStatus, ShipmentTrackingEvent } from '@commerce/types';

const AFTERSHIP_BASE = 'https://api.aftership.com/v4';

// ─── Carrier → Aftership slug mapping ────────────────────────────────────────

const CARRIER_SLUGS: Record<Carrier, string> = {
  CJ: 'cj-logistics',
  HANJIN: 'hanjin',
  LOGEN: 'logen',
  EMS: 'ems',
  DHL: 'dhl',
  FEDEX: 'fedex',
  UPS: 'ups',
  USPS: 'usps',
  YAMATO: 'yamato',
  SAGAWA: 'sagawa',
};

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

// Anti-regression: higher number = further along in flow
const STATUS_PRIORITY: Record<ShipmentStatus, number> = {
  PENDING: 0,
  PICKED_UP: 1,
  IN_TRANSIT: 2,
  CUSTOMS_HELD: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  RETURNED: 5,
};

export function mapAftershipStatus(tag: string): ShipmentStatus | null {
  return AFTERSHIP_STATUS_MAP[tag] ?? null;
}

export function isStatusProgression(current: ShipmentStatus, next: ShipmentStatus): boolean {
  return STATUS_PRIORITY[next] > STATUS_PRIORITY[current];
}

// ─── Create tracker on Aftership ─────────────────────────────────────────────

export async function createTracker(
  carrier: Carrier,
  trackingNumber: string
): Promise<string | null> {
  const apiKey = process.env.AFTERSHIP_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${AFTERSHIP_BASE}/trackings`, {
      method: 'POST',
      headers: {
        'aftership-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracking: {
          tracking_number: trackingNumber,
          slug: CARRIER_SLUGS[carrier],
        },
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { tracking?: { id?: string } } };
    return json.data?.tracking?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Fetch latest tracker status from Aftership ───────────────────────────────

interface AftershipCheckpoint {
  tag?: string;
  city?: string;
  message?: string;
  checkpoint_time?: string;
}

interface AftershipTrackingResponse {
  data?: {
    tracking?: {
      tag?: string;
      checkpoints?: AftershipCheckpoint[];
    };
  };
}

export async function fetchTrackerStatus(
  externalTrackerId: string
): Promise<{ status: ShipmentStatus; events: ShipmentTrackingEvent[] } | null> {
  const apiKey = process.env.AFTERSHIP_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${AFTERSHIP_BASE}/trackings/${externalTrackerId}`, {
      headers: { 'aftership-api-key': apiKey },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;

    const json = (await res.json()) as AftershipTrackingResponse;
    const tracking = json.data?.tracking;
    if (!tracking) return null;

    const status = mapAftershipStatus(tracking.tag ?? '') ?? 'IN_TRANSIT';

    const events: ShipmentTrackingEvent[] = (tracking.checkpoints ?? [])
      .filter((c) => !!c.checkpoint_time)
      .map((c) => ({
        status: c.tag ?? '',
        location: c.city ?? null,
        message: c.message ?? null,
        occurred_at: c.checkpoint_time!,
      }))
      .reverse();

    return { status, events };
  } catch {
    return null;
  }
}
