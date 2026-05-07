import { createClient } from '@/lib/supabase/server';

export interface PointBalance {
  balance: number;
  total_earned: number;
  total_used: number;
}

export interface PointTransactionRow {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  reason: string;
  reference_type: string | null;
  created_at: string;
}

export async function getUserPoints(userId: string): Promise<PointBalance> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('points') as any)
    .select('balance, total_earned, total_used')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return { balance: 0, total_earned: 0, total_used: 0 };
  return {
    balance: (data.balance as number) ?? 0,
    total_earned: (data.total_earned as number) ?? 0,
    total_used: (data.total_used as number) ?? 0,
  };
}

// 체크아웃 페이지용 — 잔액만 조회
export async function getUserPointBalance(userId: string): Promise<{ balance: number; pending: number } | null> {
  const pts = await getUserPoints(userId);
  return { balance: pts.balance, pending: 0 };
}

export async function getUserPointTransactions(
  userId: string,
  limit = 20
): Promise<PointTransactionRow[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('point_transactions') as any)
    .select('id, type, amount, balance_after, reason, reference_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as PointTransactionRow[]) ?? [];
}
