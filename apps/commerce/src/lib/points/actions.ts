'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// 결제 완료 시 적립률 (총액의 1%)
const EARN_RATE = 0.01;

export async function usePointsAction(amount: number, orderId?: string): Promise<void> {
  if (amount <= 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).rpc('use_points', {
    p_user_id: user.id,
    p_amount: amount,
    p_reason: '주문 결제 포인트 사용',
    p_reference_id: orderId ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function earnPointsAction(totalAmount: number, orderId?: string): Promise<void> {
  const earnAmount = Math.floor(totalAmount * EARN_RATE);
  if (earnAmount <= 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).rpc('earn_points', {
    p_user_id: user.id,
    p_amount: earnAmount,
    p_reason: `주문 완료 적립 (구매금액의 ${(EARN_RATE * 100).toFixed(0)}%)`,
    p_reference_id: orderId ?? null,
  });

  if (error) throw new Error(error.message);
}
