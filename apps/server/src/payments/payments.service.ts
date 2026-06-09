import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../supabase/supabase.module';
import { MockProvider } from './providers/mock.provider';
import type {
  CaptureParams,
  CaptureResult,
  CreateIntentParams,
  IntentResult,
  PaymentGateway,
  RefundParams,
  RefundResult,
} from './payment.types';

// PaymentService is the gateway façade. Provider selection lives here — the
// rest of the app (controllers, future webhook handlers) just calls the
// abstract methods.

@Injectable()
export class PaymentsService implements PaymentGateway {
  private readonly provider: PaymentGateway;

  constructor(@Inject(SUPABASE_ADMIN) supabase: SupabaseClient) {
    const name = process.env.PAYMENT_PROVIDER ?? 'mock';
    switch (name) {
      case 'mock':
        this.provider = new MockProvider(supabase);
        break;
      case 'stripe':
      case 'toss':
        throw new Error(
          `Payment provider "${name}" not implemented yet. Set PAYMENT_PROVIDER=mock.`
        );
      default:
        throw new Error(
          `Unknown PAYMENT_PROVIDER: "${name}". Valid values: mock | stripe | toss`
        );
    }
  }

  createIntent(params: CreateIntentParams): Promise<IntentResult> {
    return this.provider.createIntent(params);
  }

  capture(params: CaptureParams): Promise<CaptureResult> {
    return this.provider.capture(params);
  }

  refund(params: RefundParams): Promise<RefundResult> {
    return this.provider.refund(params);
  }
}
