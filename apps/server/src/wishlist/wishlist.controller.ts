import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import type { Request } from 'express';
import { WishlistService } from './wishlist.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { ProductIdParamSchema, ToggleBodySchema } from './wishlist.schemas';

// REST resource: wishlist (always scoped to the authenticated user).
//   GET  /wishlist/me                           own wishlist with product join (auth)
//   GET  /wishlist/me/products?ids=a,b,c        bulk is-wishlisted check (auth)
//   GET  /wishlist/me/products/:productId       single is-wishlisted check (auth)
//   POST /wishlist/me/toggle                    toggle a product (auth)
//
// Toggle is intentionally NOT a PUT/DELETE per-product pair: the existing UI
// (heart icon) is a single tap that flips state. Mirrors community likes.

const BulkCheckQuerySchema = z.object({
  ids: z
    .string()
    .optional()
    .transform((s) =>
      s
        ? s
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : []
    ),
});

@Controller('wishlist/me')
@UseGuards(SupabaseAuthGuard)
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  list(@Req() req: Request) {
    return this.wishlist.listForUser(req.user!.id);
  }

  // Collection-level lookup. Nest's path matching picks the more specific
  // /products/:productId for single ids; we declare the bulk route first to
  // make the intent obvious.
  @Get('products')
  async bulkCheck(
    @Req() req: Request,
    @Query(new ZodValidationPipe(BulkCheckQuerySchema))
    query: typeof BulkCheckQuerySchema._output
  ) {
    const wishlistedIds = await this.wishlist.listWishlistedIdsAmong(
      req.user!.id,
      query.ids
    );
    return { wishlisted_ids: wishlistedIds };
  }

  @Get('products/:productId')
  async check(
    @Req() req: Request,
    @Param(new ZodValidationPipe(ProductIdParamSchema))
    params: typeof ProductIdParamSchema._output
  ) {
    const isWishlisted = await this.wishlist.isWishlisted(req.user!.id, params.productId);
    return { is_wishlisted: isWishlisted };
  }

  @Post('toggle')
  async toggle(
    @Req() req: Request,
    @Body(new ZodValidationPipe(ToggleBodySchema))
    body: typeof ToggleBodySchema._output
  ) {
    const isWishlisted = await this.wishlist.toggle(req.user!.id, body.product_id);
    return { is_wishlisted: isWishlisted };
  }
}
