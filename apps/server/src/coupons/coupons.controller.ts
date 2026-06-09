import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CouponsService } from './coupons.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { IssuanceIdParamSchema, MarkUsedBodySchema } from './coupons.schemas';

// REST resource: coupons (always scoped to authenticated user).
//   GET  /coupons/me                         own usable coupons (auth)
//   POST /coupons/issuances/:issuanceId/use  mark as USED — usually invoked by
//                                            order pipeline post-payment (auth).

@Controller('coupons')
@UseGuards(SupabaseAuthGuard)
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Get('me')
  list(@Req() req: Request) {
    return this.coupons.listForUser(req.user!.id);
  }

  @Post('issuances/:issuanceId/use')
  async markUsed(
    @Param(new ZodValidationPipe(IssuanceIdParamSchema))
    params: typeof IssuanceIdParamSchema._output,
    @Body(new ZodValidationPipe(MarkUsedBodySchema))
    body: typeof MarkUsedBodySchema._output
  ) {
    await this.coupons.markUsed(params.issuanceId, body.order_id);
    return { issuance_id: params.issuanceId };
  }
}
