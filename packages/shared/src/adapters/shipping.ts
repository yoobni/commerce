import type { PaymentMode } from './payment';

// ─── Request / Result Types ───────────────────────────────────────────────────

export interface ShippingRegisterParams {
  orderId: string;
  carrier: string;
  trackingNumber: string;
}

export interface ShippingRegisterResult {
  trackerId: string;
}

export interface TrackingHistoryEntry {
  status: string;
  location: string | null;
  message: string | null;
  occurredAt: string;
}

export interface ShippingStatusResult {
  status: string;
  history: TrackingHistoryEntry[];
}

// ─── Adapter Interface ────────────────────────────────────────────────────────

export interface ShippingAdapter {
  readonly mode: PaymentMode;
  registerTracking(params: ShippingRegisterParams): Promise<ShippingRegisterResult>;
  getStatus(trackerId: string): Promise<ShippingStatusResult>;
}
