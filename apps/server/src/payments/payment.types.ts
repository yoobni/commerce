// Wire-level types for the payment gateway abstraction. Stay close to the
// previous lib/payment/types.ts so the mock provider's contract is unchanged.

export interface CreateIntentParams {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface IntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export interface CaptureParams {
  paymentIntentId: string;
  orderId: string;
  method: string;
  amount: number;
  currency: string;
}

export interface CaptureResult {
  paymentId: string;
  status: string;
}

export interface RefundParams {
  paymentIntentId: string;
  amount?: number;
}

export interface RefundResult {
  refundId: string;
  status: string;
  refundedAmount: number;
}

export interface PaymentGateway {
  createIntent(params: CreateIntentParams): Promise<IntentResult>;
  capture(params: CaptureParams): Promise<CaptureResult>;
  refund(params: RefundParams): Promise<RefundResult>;
}
