import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ReviewsService } from './reviews.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import {
  CreateReviewBodySchema,
  ListReviewsQuerySchema,
  StatsQuerySchema,
} from './reviews.schemas';

// REST resource: reviews. List/stats are scoped via ?product_id=... so we
// avoid nesting under /products/:slug (slug → id resolution would be wasted).
//
//   GET  /reviews?product_id=...&page=&per_page=&photo_only=
//   GET  /reviews/stats?product_id=...
//   POST /reviews   create (auth)

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(ListReviewsQuerySchema))
    query: typeof ListReviewsQuerySchema._output
  ) {
    return this.reviews.listForProduct({
      productId: query.product_id,
      page: query.page,
      perPage: query.per_page,
      photoOnly: query.photo_only,
    });
  }

  @Get('stats')
  stats(
    @Query(new ZodValidationPipe(StatsQuerySchema))
    query: typeof StatsQuerySchema._output
  ) {
    return this.reviews.stats(query.product_id);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateReviewBodySchema))
    body: typeof CreateReviewBodySchema._output
  ) {
    return this.reviews.create(req.user!.id, {
      productId: body.product_id,
      rating: body.rating,
      content: body.content,
      purchasedSize: body.purchased_size,
      sizeFeedback: body.size_feedback,
      dogBreed: body.dog_breed ?? null,
      dogWeightKg: body.dog_weight_kg ?? null,
    });
  }
}
