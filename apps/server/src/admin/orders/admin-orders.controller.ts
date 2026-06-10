import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminOrdersService } from './admin-orders.service';
import { AdminAuthGuard } from '../common/admin-auth.guard';
import { CurrentAdmin } from '../common/current-admin.decorator';
import type { AdminSessionPayload } from '../common/admin-session';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  AdminListOrdersQuerySchema,
  MemoBodySchema,
  RefundBodySchema,
  UpdateStatusBodySchema,
  UuidParamSchema,
} from './admin-orders.schemas';

// Admin order resource. All routes require admin auth.
//
//   GET   /admin/orders                 list (status/search filter)
//   GET   /admin/orders/:id             detail
//   PATCH /admin/orders/:id/status      state-machine validated transition
//   PATCH /admin/orders/:id/memo        admin memo
//   POST  /admin/orders/:id/refund      refund flow (PG + 포인트/쿠폰/재고 복원)

@Controller('admin/orders')
@UseGuards(AdminAuthGuard)
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(AdminListOrdersQuerySchema))
    query: typeof AdminListOrdersQuerySchema._output
  ) {
    return this.orders.list(query);
  }

  @Get(':id')
  async getById(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output
  ) {
    const row = await this.orders.getById(params.id);
    if (!row) throw new NotFoundException('order_not_found');
    return row;
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateStatus(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(UpdateStatusBodySchema))
    body: typeof UpdateStatusBodySchema._output
  ) {
    await this.orders.updateStatus(params.id, body.status);
  }

  @Patch(':id/memo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateMemo(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(MemoBodySchema)) body: typeof MemoBodySchema._output
  ) {
    await this.orders.updateMemo(params.id, body.memo);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.NO_CONTENT)
  async refund(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(RefundBodySchema)) body: typeof RefundBodySchema._output,
    @CurrentAdmin() admin: AdminSessionPayload
  ) {
    await this.orders.refund(params.id, body.amount, admin.id);
  }
}
