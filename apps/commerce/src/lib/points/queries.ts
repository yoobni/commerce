import { createClient } from '@/lib/supabase/server';

export interface PointBalance {
  balance: number;
  pending: number;
}

export async function getUserPointBalance(userId: string): Promise<PointBalance | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('point_balances') as any)
    .select('balance, pending')
    .eq('user_id', userId)
    .single();
  if (!data) return { balance: 0, pending: 0 };
  return { balance: (data.balance as number) ?? 0, pending: (data.pending as number) ?? 0 };
}
