import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';
import type {
  Carrier,
  Order,
  OrderItem,
  OrderStatus,
  PaginatedResponse,
  Shipment,
  ShipmentStatus,
  User,
} from '@commerce/types';

export interface ShippingOrderRow extends Order {
  user: Pick<User, 'id' | 'name' | 'email'> | null;
  shipment: Shipment | null;
}

export interface ShippingOrderDetail extends Order {
  items: OrderItem[];
  user: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null;
  shipment: Shipment | null;
}

export interface ListParams {
  status?: 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

const SHIPPING_STATUSES: OrderStatus[] = ['PREPARING', 'SHIPPED', 'DELIVERED'];

// Shipment state machine — kept server-side.
const SHIPMENT_TRANSITIONS: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
  PENDING: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['CUSTOMS_HELD', 'OUT_FOR_DELIVERY'],
  CUSTOMS_HELD: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
  DELIVERED: [],
  RETURNED: [],
};

@Injectable()
export class AdminShipmentsService {
  private readonly logger = new Logger(AdminShipmentsService.name);

  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async listOrders(params: ListParams = {}): Promise<PaginatedResponse<ShippingOrderRow>> {
    const { status = 'ALL', search, page = 1, per_page = 20 } = params;
    const offset = (page - 1) * per_page;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.supabase.from('orders') as any).select(
      '*, user:users!user_id(id, name, email), shipment:shipments(*)',
      { count: 'exact' }
    );
    if (status !== 'ALL') query = query.eq('status', status);
    else query = query.in('status', SHIPPING_STATUSES);
    if (search) {
      const safe = search.replace(/[%_]/g, (m) => `\\${m}`);
      query = query.ilike('order_number', `%${safe}%`);
    }
    query = query.order('ordered_at', { ascending: false }).range(offset, offset + per_page - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count ?? 0;
    const rows = ((data ?? []) as ShippingOrderRow[]).map((row) => ({
      ...row,
      shipment: Array.isArray(row.shipment) ? (row.shipment[0] ?? null) : row.shipment,
    }));

    return {
      data: rows,
      total,
      page,
      per_page,
      has_next: offset + per_page < total,
    };
  }

  async getOrder(id: string): Promise<ShippingOrderDetail | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('orders') as any)
      .select(
        `*,
        items:order_items(*),
        user:users!user_id(id, name, email, phone),
        shipment:shipments(*)`
      )
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as ShippingOrderDetail & { shipment: Shipment | Shipment[] | null };
    return {
      ...row,
      shipment: Array.isArray(row.shipment) ? (row.shipment[0] ?? null) : row.shipment,
    };
  }

  /**
   * Issue an invoice for an order: upsert the shipments row (PENDING) and
   * advance the order to SHIPPED. Idempotent via onConflict='order_id'.
   *
   * TODO (계획): docs/shipping-tracking-plan.md — 외부 tracker 생성 + 동기화.
   */
  async startShipment(
    orderId: string,
    carrier: Carrier,
    trackingNumber: string,
    country: string
  ): Promise<void> {
    const tn = trackingNumber.trim();
    if (!tn) throw new BadRequestException('tracking_number_required');

    const now = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: shipError } = await (this.supabase.from('shipments') as any).upsert(
      {
        order_id: orderId,
        carrier,
        tracking_number: tn,
        country,
        status: 'PENDING',
        shipped_at: now,
        updated_at: now,
      },
      { onConflict: 'order_id' }
    );
    if (shipError) {
      this.logger.error(`[startShipment/upsert] ${shipError.message}`);
      throw new BadRequestException('shipment_upsert_failed');
    }

    // Advance order PREPARING → SHIPPED. The .eq('status', 'PREPARING')
    // ensures we don't accidentally regress later statuses.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: orderError } = await (this.supabase.from('orders') as any)
      .update({ status: 'SHIPPED', updated_at: now })
      .eq('id', orderId)
      .eq('status', 'PREPARING');
    if (orderError) {
      this.logger.error(`[startShipment/order] ${orderError.message}`);
      throw new BadRequestException('order_status_update_failed');
    }
  }

  async updateShipmentStatus(shipmentId: string, newStatus: ShipmentStatus): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current } = await (this.supabase.from('shipments') as any)
      .select('status, order_id')
      .eq('id', shipmentId)
      .maybeSingle();
    if (!current) throw new NotFoundException('shipment_not_found');

    const allowed =
      SHIPMENT_TRANSITIONS[(current as { status: ShipmentStatus }).status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException('invalid_shipment_transition');
    }

    const now = new Date().toISOString();
    const patch: Record<string, string> = { status: newStatus, updated_at: now };
    if (newStatus === 'DELIVERED') patch.delivered_at = now;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('shipments') as any)
      .update(patch)
      .eq('id', shipmentId);
    if (error) {
      this.logger.error(`[updateShipmentStatus] ${error.message}`);
      throw new BadRequestException('shipment_status_update_failed');
    }
  }

  async setReturnTracking(shipmentId: string, returnTrackingNumber: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current } = await (this.supabase.from('shipments') as any)
      .select('order_id')
      .eq('id', shipmentId)
      .maybeSingle();
    if (!current) throw new NotFoundException('shipment_not_found');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('shipments') as any)
      .update({
        return_tracking_number: returnTrackingNumber.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentId);
    if (error) {
      this.logger.error(`[setReturnTracking] ${error.message}`);
      throw new BadRequestException('return_tracking_update_failed');
    }
  }
}
