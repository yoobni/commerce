export type PaymentMode = 'mock' | 'real';

// ─── Request / Result Types ───────────────────────────────────────────────────

export interface PaymentInitiateParams {
  orderId: string;
  amount: number;
  currency: string;
  method: string;
}

export interface PaymentInitiateResult {
  paymentRef: string;
  redirectUrl: string | null;
}

export interface PaymentConfirmResult {
  status: 'PAID' | 'FAILED';
  paidAt: string | null;
  raw: Record<string, unknown>;
}

export interface PaymentCancelResult {
  refundedAt: string;
  raw: Record<string, unknown>;
}

// ─── Adapter Interface ────────────────────────────────────────────────────────

export interface PaymentAdapter {
  readonly mode: PaymentMode;
  initiate(params: PaymentInitiateParams): Promise<PaymentInitiateResult>;
  confirm(paymentRef: string): Promise<PaymentConfirmResult>;
  cancel(paymentRef: string, amount?: number): Promise<PaymentCancelResult>;
}
