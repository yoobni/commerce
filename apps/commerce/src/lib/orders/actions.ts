'use server';

import { createClient } from '@/lib/supabase/server';
import type { OrderStatus } from '@commerce/types';

const CANCELLABLE_STATUSES: OrderStatus[] = ['PENDING_PAYMENT', 'PAID', 'PREPARING'];

export async function cancelOrderAction(
  orderId: string,
  reason: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: fetchError } = await (supabase.from('orders') as any)
    .select('id, status, user_id')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !order) return { success: false, error: 'order_not_found' };

  if (!CANCELLABLE_STATUSES.includes(order.status as OrderStatus)) {
    return { success: false, error: 'not_cancellable' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({
      status: 'CANCELLED',
      cancel_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: (error as { message?: string }).message };
  return { success: true };
}
