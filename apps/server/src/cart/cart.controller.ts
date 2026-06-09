import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CartService } from './cart.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import {
  AddCartItemBodySchema,
  CartItemIdParamSchema,
  UpdateCartItemBodySchema,
} from './cart.schemas';

// REST resource: cart (always one per user → scope under /cart/me).
//   GET    /cart/me                          full cart with items (auth)
//   POST   /cart/me/items                    add (merges if same option) (auth)
//   PATCH  /cart/me/items/:itemId            update quantity (auth + ownership)
//   DELETE /cart/me/items/:itemId            remove (auth + ownership)

@Controller('cart/me')
@UseGuards(SupabaseAuthGuard)
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  get(@Req() req: Request) {
    return this.cart.getForUser(req.user!.id);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Req() req: Request,
    @Body(new ZodValidationPipe(AddCartItemBodySchema))
    body: typeof AddCartItemBodySchema._output
  ) {
    await this.cart.addItem(req.user!.id, body.option_id, body.quantity, body.currency);
    // Return the updated cart so the client can re-render without a second fetch.
    return this.cart.getForUser(req.user!.id);
  }

  @Patch('items/:itemId')
  async update(
    @Req() req: Request,
    @Param(new ZodValidationPipe(CartItemIdParamSchema))
    params: typeof CartItemIdParamSchema._output,
    @Body(new ZodValidationPipe(UpdateCartItemBodySchema))
    body: typeof UpdateCartItemBodySchema._output
  ) {
    try {
      await this.cart.updateItemQuantity(req.user!.id, params.itemId, body.quantity);
    } catch (e) {
      if ((e as Error).message === 'forbidden') throw new ForbiddenException('forbidden');
      throw e;
    }
    return { id: params.itemId };
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request,
    @Param(new ZodValidationPipe(CartItemIdParamSchema))
    params: typeof CartItemIdParamSchema._output
  ) {
    try {
      await this.cart.removeItem(req.user!.id, params.itemId);
    } catch (e) {
      if ((e as Error).message === 'forbidden') throw new ForbiddenException('forbidden');
      throw e;
    }
  }
}
