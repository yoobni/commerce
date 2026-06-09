import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';

// One-directional, silent blocks (no notification to blocked party).

@Injectable()
export class UserBlocksService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async listForViewer(viewerId: string): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('user_blocks') as any)
      .select('blocked_id')
      .eq('blocker_id', viewerId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map((r) => r.blocked_id as string);
  }

  /** Idempotent — re-blocking a user is a no-op. */
  async block(viewerId: string, targetUserId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('user_blocks') as any).insert({
      blocker_id: viewerId,
      blocked_id: targetUserId,
    });
    // 23505 = unique_violation → already blocked → treat as success.
    if (error && (error as { code?: string }).code !== '23505') {
      throw error;
    }
  }

  /** Idempotent — unblocking someone who wasn't blocked is a no-op. */
  async unblock(viewerId: string, targetUserId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('user_blocks') as any)
      .delete()
      .eq('blocker_id', viewerId)
      .eq('blocked_id', targetUserId);
    if (error) throw error;
  }
}
