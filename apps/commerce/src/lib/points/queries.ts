import { createClient } from '@/lib/supabase/server';
import type { Point } from '@commerce/types';

export async function getUserPoints(userId: string): Promise<Point | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('points')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    balance: Number(row.balance),
    total_earned: Number(row.total_earned),
    total_used: Number(row.total_used),
    total_expired: Number(row.total_expired),
    updated_at: row.updated_at as string,
  };
}
