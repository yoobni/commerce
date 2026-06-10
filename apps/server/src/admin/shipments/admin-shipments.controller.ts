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
import { AdminShipmentsService } from './admin-shipments.service';
import { AdminAuthGuard } from '../common/admin-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  AdminListShippingOrdersQuerySchema,
  OrderIdParamSchema,
  ReturnTrackingBodySchema,
  ShipmentIdParamSchema,
  ShipmentStatusBodySchema,
  StartShipmentBodySchema,
} from './admin-shipments.schemas';

// 두 sub-resource 를 한 controller 에 둠 — admin shipping context 에서
// order list/detail 과 shipment status 가 같이 다뤄지기 때문.
//
//   GET   /admin/shipping/orders              list (PREPARING/SHIPPED/DELIVERED)
//   GET   /admin/shipping/orders/:id          detail (+ items + shipment)
//   POST  /admin/shipping/orders/:id/start    invoice 입력 + 주문 SHIPPED 로
//   PATCH /admin/shipping/shipments/:id/status
//   PATCH /admin/shipping/shipments/:id/return-tracking

@Controller('admin/shipping')
@UseGuards(AdminAuthGuard)
export class AdminShipmentsController {
  constructor(private readonly shipments: AdminShipmentsService) {}

  @Get('orders')
  listOrders(
    @Query(new ZodValidationPipe(AdminListShippingOrdersQuerySchema))
    query: typeof AdminListShippingOrdersQuerySchema._output
  ) {
    return this.shipments.listOrders(query);
  }

  @Get('orders/:id')
  async getOrder(
    @Param(new ZodValidationPipe(OrderIdParamSchema))
    params: typeof OrderIdParamSchema._output
  ) {
    const row = await this.shipments.getOrder(params.id);
    if (!row) throw new NotFoundException('order_not_found');
    return row;
  }

  @Post('orders/:id/start')
  @HttpCode(HttpStatus.NO_CONTENT)
  async start(
    @Param(new ZodValidationPipe(OrderIdParamSchema))
    params: typeof OrderIdParamSchema._output,
    @Body(new ZodValidationPipe(StartShipmentBodySchema))
    body: typeof StartShipmentBodySchema._output
  ) {
    await this.shipments.startShipment(
      params.id,
      body.carrier,
      body.tracking_number,
      body.country
    );
  }

  @Patch('shipments/:id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateStatus(
    @Param(new ZodValidationPipe(ShipmentIdParamSchema))
    params: typeof ShipmentIdParamSchema._output,
    @Body(new ZodValidationPipe(ShipmentStatusBodySchema))
    body: typeof ShipmentStatusBodySchema._output
  ) {
    await this.shipments.updateShipmentStatus(params.id, body.status);
  }

  @Patch('shipments/:id/return-tracking')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setReturnTracking(
    @Param(new ZodValidationPipe(ShipmentIdParamSchema))
    params: typeof ShipmentIdParamSchema._output,
    @Body(new ZodValidationPipe(ReturnTrackingBodySchema))
    body: typeof ReturnTrackingBodySchema._output
  ) {
    await this.shipments.setReturnTracking(params.id, body.return_tracking_number);
  }
}
