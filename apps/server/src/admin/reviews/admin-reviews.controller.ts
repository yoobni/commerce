import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminReviewsService } from './admin-reviews.service';
import { AdminAuthGuard } from '../common/admin-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  AdminListReviewsQuerySchema,
  BestBodySchema,
  PointRewardedBodySchema,
  StatusBodySchema,
  UuidParamSchema,
} from './admin-reviews.schemas';

//   GET   /admin/reviews                       list
//   GET   /admin/reviews/:id                   detail
//   PATCH /admin/reviews/:id/status            ACTIVE/HIDDEN/DELETED
//   PATCH /admin/reviews/:id/best              is_best toggle
//   PATCH /admin/reviews/:id/point-rewarded    point_rewarded toggle

@Controller('admin/reviews')
@UseGuards(AdminAuthGuard)
export class AdminReviewsController {
  constructor(private readonly reviews: AdminReviewsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(AdminListReviewsQuerySchema))
    query: typeof AdminListReviewsQuerySchema._output
  ) {
    return this.reviews.list(query);
  }

  @Get(':id')
  async getById(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output
  ) {
    const row = await this.reviews.getById(params.id);
    if (!row) throw new NotFoundException('review_not_found');
    return row;
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setStatus(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(StatusBodySchema)) body: typeof StatusBodySchema._output
  ) {
    await this.reviews.setStatus(params.id, body.status);
  }

  @Patch(':id/best')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setBest(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(BestBodySchema)) body: typeof BestBodySchema._output
  ) {
    await this.reviews.setBest(params.id, body.is_best);
  }

  @Patch(':id/point-rewarded')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setPointRewarded(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(PointRewardedBodySchema))
    body: typeof PointRewardedBodySchema._output
  ) {
    await this.reviews.setPointRewarded(params.id, body.rewarded);
  }
}
