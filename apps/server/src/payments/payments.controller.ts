import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { CaptureBodySchema, CreateIntentBodySchema } from './payments.schemas';

// REST resource: payments. Both flows require auth — payment intents and
// captures are user-scoped financial side-effects.
//
//   POST /payments/intents    create an intent at the PG (auth)
//   POST /payments/captures   record a capture after PG webhook (auth)
//
// Webhooks (Stripe / Toss callback signatures) will land as separate routes
// with provider-specific verification when those providers ship.

@Controller('payments')
@UseGuards(SupabaseAuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('intents')
  @HttpCode(HttpStatus.CREATED)
  createIntent(
    @Body(new ZodValidationPipe(CreateIntentBodySchema))
    body: typeof CreateIntentBodySchema._output
  ) {
    return this.payments.createIntent({
      amount: body.amount,
      currency: body.currency,
      metadata: body.metadata,
    });
  }

  @Post('captures')
  @HttpCode(HttpStatus.CREATED)
  capture(
    @Body(new ZodValidationPipe(CaptureBodySchema))
    body: typeof CaptureBodySchema._output
  ) {
    return this.payments.capture({
      paymentIntentId: body.payment_intent_id,
      orderId: body.order_id,
      method: body.method,
      amount: body.amount,
      currency: body.currency,
    });
  }
}
