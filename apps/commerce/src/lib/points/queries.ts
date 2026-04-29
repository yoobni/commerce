import { createClient } from '@/lib/supabase/server';
import type { Point, PointTransaction, PaginatedResponse } from '@commerce/types';

export async function getUserPointBalance(userId: string): Promise<Point | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('points') as any)
    .select('*')
    .eq('user_id', userId)
    .single();

  return (data as Point) ?? null;
}

export async function getUserPointTransactions(
  userId: string,
  { page = 1, per_page = 20 }: { page?: number; per_page?: number } = {}
): Promise<PaginatedResponse<PointTransaction>> {
  const supabase = await createClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (supabase.from('point_transactions') as any)
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as PointTransaction[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}
