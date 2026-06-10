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
import { AdminCouponsService } from './admin-coupons.service';
import { AdminAuthGuard } from '../common/admin-auth.guard';
import { CurrentAdmin } from '../common/current-admin.decorator';
import type { AdminSessionPayload } from '../common/admin-session';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  AdminListCouponsQuerySchema,
  CouponIdParamSchema,
  IssuanceListQuerySchema,
  IssuanceParamsSchema,
  IssueCouponBodySchema,
  SaveCouponBodySchema,
  UpdateCouponStatusBodySchema,
} from './admin-coupons.schemas';

//   GET    /admin/coupons                                  list
//   GET    /admin/coupons/:id                              detail
//   POST   /admin/coupons                                  create
//   PATCH  /admin/coupons/:id                              update
//   PATCH  /admin/coupons/:id/status                       status flip
//   GET    /admin/coupons/:id/issuances                    issuance list
//   POST   /admin/coupons/:id/issuances                    issue by email
//   PATCH  /admin/coupons/:id/issuances/:issuanceId/revoke revoke

@Controller('admin/coupons')
@UseGuards(AdminAuthGuard)
export class AdminCouponsController {
  constructor(private readonly coupons: AdminCouponsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(AdminListCouponsQuerySchema))
    query: typeof AdminListCouponsQuerySchema._output
  ) {
    return this.coupons.list(query);
  }

  @Get(':id')
  async getById(
    @Param(new ZodValidationPipe(CouponIdParamSchema))
    params: typeof CouponIdParamSchema._output
  ) {
    const row = await this.coupons.getById(params.id);
    if (!row) throw new NotFoundException('coupon_not_found');
    return row;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(SaveCouponBodySchema))
    body: typeof SaveCouponBodySchema._output,
    @CurrentAdmin() admin: AdminSessionPayload
  ) {
    return this.coupons.save(null, body, admin.id);
  }

  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(CouponIdParamSchema))
    params: typeof CouponIdParamSchema._output,
    @Body(new ZodValidationPipe(SaveCouponBodySchema))
    body: typeof SaveCouponBodySchema._output,
    @CurrentAdmin() admin: AdminSessionPayload
  ) {
    return this.coupons.save(params.id, body, admin.id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateStatus(
    @Param(new ZodValidationPipe(CouponIdParamSchema))
    params: typeof CouponIdParamSchema._output,
    @Body(new ZodValidationPipe(UpdateCouponStatusBodySchema))
    body: typeof UpdateCouponStatusBodySchema._output
  ) {
    await this.coupons.updateStatus(params.id, body.status);
  }

  @Get(':id/issuances')
  listIssuances(
    @Param(new ZodValidationPipe(CouponIdParamSchema))
    params: typeof CouponIdParamSchema._output,
    @Query(new ZodValidationPipe(IssuanceListQuerySchema))
    query: typeof IssuanceListQuerySchema._output
  ) {
    return this.coupons.listIssuances(params.id, query.page, query.per_page);
  }

  @Post(':id/issuances')
  @HttpCode(HttpStatus.CREATED)
  async issue(
    @Param(new ZodValidationPipe(CouponIdParamSchema))
    params: typeof CouponIdParamSchema._output,
    @Body(new ZodValidationPipe(IssueCouponBodySchema))
    body: typeof IssueCouponBodySchema._output
  ) {
    await this.coupons.issueByEmail(params.id, body.email);
    return { ok: true };
  }

  @Patch(':id/issuances/:issuanceId/revoke')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(
    @Param(new ZodValidationPipe(IssuanceParamsSchema))
    params: typeof IssuanceParamsSchema._output
  ) {
    await this.coupons.revokeIssuance(params.issuanceId);
  }
}
