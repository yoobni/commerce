'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function earnPointsForOrder(
  userId: string,
  orderId: string,
  orderNumber: string,
  orderTotal: number
): Promise<{ success: boolean; pointsEarned?: number; error?: string }> {
  const admin = createAdminClient();

  const pointsEarned = Math.floor(orderTotal * 0.01);
  if (pointsEarned <= 0) return { success: true, pointsEarned: 0 };

  const { data: pts } = await (admin.from('points') as any)
    .select('id, balance, total_earned')
    .eq('user_id', userId)
    .maybeSingle();

  if (!pts) return { success: false, error: 'points_record_not_found' };

  const p = pts as { id: string; balance: number; total_earned: number };
  const newBalance = p.balance + pointsEarned;
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await (admin.from('points') as any)
    .update({
      balance: newBalance,
      total_earned: p.total_earned + pointsEarned,
      updated_at: new Date().toISOString(),
    })
    .eq('id', p.id);

  await (admin.from('point_transactions') as any).insert({
    user_id: userId,
    type: 'EARN',
    amount: pointsEarned,
    balance_after: newBalance,
    reason: `주문 구매 적립 (${orderNumber})`,
    reference_type: 'ORDER',
    reference_id: orderId,
    expires_at: expiresAt.toISOString(),
  });

  return { success: true, pointsEarned };
}
