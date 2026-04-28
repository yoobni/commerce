import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Orders in PENDING_PAYMENT status (waiting for action)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: pendingCount } = await (supabase.from('orders') as any)
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING_PAYMENT');

  // New orders (last 5 min) still in PENDING_PAYMENT
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newOrders } = await (supabase.from('orders') as any)
    .select('id, order_number, total_amount, ordered_at, user:users!user_id(name)')
    .eq('status', 'PENDING_PAYMENT')
    .gte('ordered_at', since)
    .order('ordered_at', { ascending: false })
    .limit(5);

  const formatted = (newOrders ?? []).map(
    (o: {
      id: string;
      order_number: string;
      total_amount: number;
      ordered_at: string;
      user: { name: string } | null;
    }) => ({
      id: o.id,
      order_number: o.order_number,
      total_amount: o.total_amount,
      ordered_at: o.ordered_at,
      user_name: o.user?.name ?? null,
    })
  );

  return NextResponse.json({
    pendingCount: pendingCount ?? 0,
    newOrders: formatted,
  });
}
