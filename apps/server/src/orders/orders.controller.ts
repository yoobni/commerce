import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import {
  CreateOrderBodySchema,
  ListOrdersQuerySchema,
  OrderIdParamSchema,
} from './orders.schemas';

// REST resource: orders (always scoped to the authenticated user).
//   GET  /orders/me                   own list (auth)
//   GET  /orders/me/:id               own order detail with items (auth)
//   POST /orders                      create (auth)
//   POST /orders/:id/cancel           cancel — soft "cancelled" status (auth)
//
// Cancel is an action endpoint by design: cancellation has side effects
// (refunds, inventory release) the future RPC will handle. A naive
// PATCH /orders/:id { status: 'cancelled' } would bypass those.

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  list(
    @Req() req: Request,
    @Query(new ZodValidationPipe(ListOrdersQuerySchema))
    query: typeof ListOrdersQuerySchema._output
  ) {
    return this.orders.listForUser(req.user!.id, {
      page: query.page,
      perPage: query.per_page,
    });
  }

  @Get('me/:id')
  @UseGuards(SupabaseAuthGuard)
  async getOne(
    @Req() req: Request,
    @Param(new ZodValidationPipe(OrderIdParamSchema))
    params: typeof OrderIdParamSchema._output
  ) {
    const order = await this.orders.getForUser(params.id, req.user!.id);
    if (!order) throw new NotFoundException('order_not_found');
    return order;
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateOrderBodySchema))
    body: typeof CreateOrderBodySchema._output
  ) {
    return this.orders.create(req.user!.id, {
      cartId: body.cart_id,
      shipping: {
        addressId: body.shipping.address_id,
        recipientName: body.shipping.recipient_name,
        phone: body.shipping.phone,
        postalCode: body.shipping.postal_code,
        addressLine1: body.shipping.address_line1,
        addressLine2: body.shipping.address_line2 ?? null,
        deliveryMemo: body.shipping.delivery_memo ?? null,
      },
      items: body.items.map((i) => ({
        productOptionId: i.product_option_id,
        quantity: i.quantity,
        unitPrice: i.unit_price,
        totalPrice: i.total_price,
        snapshot: i.snapshot,
      })),
      couponIssuanceId: body.coupon_issuance_id ?? null,
      pointUsed: body.point_used,
      currency: body.currency,
      subtotal: body.subtotal,
      shippingFee: body.shipping_fee,
      discountAmount: body.discount_amount,
      taxAmount: body.tax_amount,
      totalAmount: body.total_amount,
    });
  }

  @Post(':id/cancel')
  @UseGuards(SupabaseAuthGuard)
  async cancel(
    @Req() req: Request,
    @Param(new ZodValidationPipe(OrderIdParamSchema))
    params: typeof OrderIdParamSchema._output
  ) {
    const exists = await this.orders.getForUser(params.id, req.user!.id);
    if (!exists) throw new NotFoundException('order_not_found');
    await this.orders.cancel(params.id, req.user!.id);
    return { id: params.id, status: 'cancelled' };
  }
}
