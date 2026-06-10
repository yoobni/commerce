import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';
import type {
  AuthProvider,
  PaginatedResponse,
  User,
  UserStatus,
} from '@commerce/types';

export interface MemberRow {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
  country: string;
  status: UserStatus;
  last_login_at: string | null;
  created_at: string;
}

export interface MemberOrderRow {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  ordered_at: string;
}

export interface ListParams {
  status?: UserStatus | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

@Injectable()
export class AdminMembersService {
  private readonly logger = new Logger(AdminMembersService.name);

  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async list(params: ListParams = {}): Promise<PaginatedResponse<MemberRow>> {
    const { status = 'ALL', search, page = 1, per_page = 20 } = params;
    const offset = (page - 1) * per_page;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.supabase.from('users') as any).select(
      'id, email, name, provider, country, status, last_login_at, created_at',
      { count: 'exact' }
    );
    if (status !== 'ALL') query = query.eq('status', status);
    if (search) {
      const safe = search.replace(/[%_]/g, (m) => `\\${m}`);
      query = query.or(`email.ilike.%${safe}%,name.ilike.%${safe}%`);
    }
    query = query.order('created_at', { ascending: false }).range(offset, offset + per_page - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count ?? 0;
    return {
      data: (data ?? []) as MemberRow[],
      total,
      page,
      per_page,
      has_next: offset + per_page < total,
    };
  }

  async getById(id: string): Promise<User | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('users') as any)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return data as User;
  }

  async listOrders(userId: string, limit = 5): Promise<MemberOrderRow[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('orders') as any)
      .select('id, order_number, total_amount, status, ordered_at')
      .eq('user_id', userId)
      .order('ordered_at', { ascending: false })
      .limit(limit);
    if (error) {
      this.logger.warn(`[listOrders] ${error.message}`);
      return [];
    }
    return (data ?? []) as MemberOrderRow[];
  }

  async updateStatus(id: string, status: UserStatus): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('users') as any)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      this.logger.error(`[updateStatus] ${error.message}`);
      throw new BadRequestException('status_update_failed');
    }
  }
}
