'use server';

import { createClient } from '@/lib/supabase/server';

export async function cancelOrderAction(orderId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
}
