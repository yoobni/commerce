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
  Coupon,
  CouponIssuance,
  CouponStatus,
  CouponType,
  Currency,
  PaginatedResponse,
  User,
} from '@commerce/types';

export interface CouponRow extends Coupon {
  issuance_count: number;
  used_count: number;
}

export interface IssuanceRow extends CouponIssuance {
  user: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface ListParams {
  status?: CouponStatus | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

interface SaveCouponInput {
  code: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  name_de: string;
  type: CouponType;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  currency: Currency | null;
  max_issuance_count: number | null;
  max_use_per_user: number;
  is_combinable: boolean;
  starts_at: string;
  expires_at: string;
}

@Injectable()
export class AdminCouponsService {
  private readonly logger = new Logger(AdminCouponsService.name);

  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async list(params: ListParams = {}): Promise<PaginatedResponse<CouponRow>> {
    const { status = 'ALL', search, page = 1, per_page = 20 } = params;
    const offset = (page - 1) * per_page;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.supabase.from('coupons') as any).select('*', { count: 'exact' });
    if (status !== 'ALL') query = query.eq('status', status);
    if (search) {
      const safe = search.replace(/[%_]/g, (m) => `\\${m}`);
      query = query.or(`code.ilike.%${safe}%,name_ko.ilike.%${safe}%`);
    }
    query = query.order('created_at', { ascending: false }).range(offset, offset + per_page - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const coupons = (data ?? []) as Coupon[];
    const total = count ?? 0;

    const rows: CouponRow[] = await Promise.all(
      coupons.map(async (coupon) => {
        const [{ count: issued }, { count: used }] = await Promise.all([
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this.supabase.from('coupon_issuances') as any)
            .select('*', { count: 'exact', head: true })
            .eq('coupon_id', coupon.id),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this.supabase.from('coupon_issuances') as any)
            .select('*', { count: 'exact', head: true })
            .eq('coupon_id', coupon.id)
            .eq('status', 'USED'),
        ]);
        return { ...coupon, issuance_count: issued ?? 0, used_count: used ?? 0 };
      })
    );

    return {
      data: rows,
      total,
      page,
      per_page,
      has_next: offset + per_page < total,
    };
  }

  async getById(id: string): Promise<Coupon | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('coupons') as any)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return data as Coupon;
  }

  async save(
    id: string | null,
    input: SaveCouponInput,
    createdBy: string
  ): Promise<{ id: string }> {
    const now = new Date().toISOString();
    if (!id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.supabase.from('coupons') as any)
        .insert({
          ...input,
          status: 'ACTIVE' as CouponStatus,
          created_by: createdBy,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();
      if (error) {
        this.logger.error(`[save/create] ${error.message}`);
        throw new BadRequestException('coupon_create_failed');
      }
      return { id: (data as { id: string }).id };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('coupons') as any)
      .update({ ...input, updated_at: now })
      .eq('id', id);
    if (error) {
      this.logger.error(`[save/update] ${error.message}`);
      throw new BadRequestException('coupon_update_failed');
    }
    return { id };
  }

  async updateStatus(id: string, status: CouponStatus): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('coupons') as any)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      this.logger.error(`[updateStatus] ${error.message}`);
      throw new BadRequestException('status_update_failed');
    }
  }

  async listIssuances(
    couponId: string,
    page = 1,
    per_page = 20
  ): Promise<PaginatedResponse<IssuanceRow>> {
    const offset = (page - 1) * per_page;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, count, error } = await (this.supabase.from('coupon_issuances') as any)
      .select('*, user:users!user_id(id, name, email)', { count: 'exact' })
      .eq('coupon_id', couponId)
      .order('issued_at', { ascending: false })
      .range(offset, offset + per_page - 1);
    if (error) throw error;

    const total = count ?? 0;
    return {
      data: (data ?? []) as IssuanceRow[],
      total,
      page,
      per_page,
      has_next: offset + per_page < total,
    };
  }

  /**
   * Issue a coupon to a user looked up by email. Enforces max_issuance_count
   * (global cap) and max_use_per_user (per-user cap, excludes REVOKED).
   */
  async issueByEmail(couponId: string, email: string): Promise<void> {
    // 1. Find user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userRow } = await (this.supabase.from('users') as any)
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    if (!userRow) throw new BadRequestException('user_not_found');
    const userId = (userRow as { id: string }).id;

    // 2. Get coupon
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: coupon } = await (this.supabase.from('coupons') as any)
      .select('status, max_issuance_count, max_use_per_user, expires_at')
      .eq('id', couponId)
      .maybeSingle();
    if (!coupon) throw new NotFoundException('coupon_not_found');
    const c = coupon as {
      status: string;
      max_issuance_count: number | null;
      max_use_per_user: number;
      expires_at: string;
    };
    if (c.status !== 'ACTIVE') throw new BadRequestException('coupon_not_active');

    // 3. Cap checks
    if (c.max_issuance_count !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (this.supabase.from('coupon_issuances') as any)
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', couponId);
      if ((count ?? 0) >= c.max_issuance_count) {
        throw new BadRequestException('issuance_cap_reached');
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: userCount } = await (this.supabase.from('coupon_issuances') as any)
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', couponId)
      .eq('user_id', userId)
      .neq('status', 'REVOKED');
    if ((userCount ?? 0) >= c.max_use_per_user) {
      throw new BadRequestException('user_cap_reached');
    }

    // 4. Insert issuance
    const now = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('coupon_issuances') as any).insert({
      coupon_id: couponId,
      user_id: userId,
      status: 'ISSUED',
      used_at: null,
      used_order_id: null,
      issued_at: now,
      expires_at: c.expires_at,
    });
    if (error) {
      this.logger.error(`[issueByEmail] ${error.message}`);
      throw new BadRequestException('issuance_failed');
    }
  }

  async revokeIssuance(issuanceId: string): Promise<void> {
    // Only revoke ISSUED (USED rows stay as audit trail).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('coupon_issuances') as any)
      .update({ status: 'REVOKED', updated_at: new Date().toISOString() })
      .eq('id', issuanceId)
      .eq('status', 'ISSUED');
    if (error) {
      this.logger.error(`[revokeIssuance] ${error.message}`);
      throw new BadRequestException('revoke_failed');
    }
  }
}
