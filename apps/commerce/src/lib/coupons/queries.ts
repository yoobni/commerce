import { createClient } from '@/lib/supabase/server';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  expires_at: string | null;
}

export async function getUserCoupons(userId: string): Promise<Coupon[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('user_coupons') as any)
    .select(
      `
      coupons (
        id,
        code,
        discount_type,
        discount_value,
        min_order_amount,
        expires_at
      )
    `
    )
    .eq('user_id', userId)
    .eq('used', false);
  if (!data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).flatMap((row) => (row.coupons ? [row.coupons as Coupon] : []));
}
