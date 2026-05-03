import { createClient } from '@/lib/supabase/server';
import type { Point, PointTransaction } from '@commerce/types';

export async function getUserPoints(userId: string): Promise<Point | null> {
  const supabase = await createClient();
  const { data } = await (supabase.from('points') as any)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as Point) ?? null;
}

export async function getUserPointTransactions(
  userId: string,
  { page = 1, per_page = 20 }: { page?: number; per_page?: number } = {}
): Promise<PointTransaction[]> {
  const supabase = await createClient();
  const offset = (page - 1) * per_page;
  const { data } = await (supabase.from('point_transactions') as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);
  return (data as PointTransaction[]) ?? [];
}
