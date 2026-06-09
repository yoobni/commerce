import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../supabase/supabase.module';

export interface PointBalance {
  balance: number;
  pending: number;
}

@Injectable()
export class PointsService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async getBalanceForUser(userId: string): Promise<PointBalance> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('point_balances') as any)
      .select('balance, pending')
      .eq('user_id', userId)
      .single();
    if (!data) return { balance: 0, pending: 0 };
    return {
      balance: (data.balance as number) ?? 0,
      pending: (data.pending as number) ?? 0,
    };
  }
}
