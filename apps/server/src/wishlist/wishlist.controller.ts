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
import { WishlistService } from './wishlist.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { ProductIdParamSchema, ToggleBodySchema } from './wishlist.schemas';

// REST resource: wishlist (always scoped to the authenticated user).
//   GET  /wishlist/me                           own wishlist (auth)
//   GET  /wishlist/me/products/:productId       is-wishlisted check (auth)
//   POST /wishlist/me/toggle                    toggle a product (auth)
//
// Toggle is intentionally NOT a PUT/DELETE per-product pair: the existing UI
// (heart icon) is a single tap that flips state. Mirrors community likes.

@Controller('wishlist/me')
@UseGuards(SupabaseAuthGuard)
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  list(@Req() req: Request) {
    return this.wishlist.listForUser(req.user!.id);
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
