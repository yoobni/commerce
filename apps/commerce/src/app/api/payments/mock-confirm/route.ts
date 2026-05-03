import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as { orderId: string; amount: number };
  const { orderId, amount } = body;

  if (!orderId || typeof amount !== 'number') {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: order } = await (admin.from('orders') as any)
    .select('id, order_number, user_id, status, total_amount')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });

  const o = order as {
    id: string;
    order_number: string;
    user_id: string;
    status: string;
    total_amount: number;
  };

  if (o.status !== 'PENDING_PAYMENT') {
    return NextResponse.json({ error: 'invalid_order_status' }, { status: 400 });
  }

  if (Math.abs(o.total_amount - amount) > 1) {
    return NextResponse.json({ error: 'amount_mismatch' }, { status: 400 });
  }

  const now = new Date().toISOString();

  await (admin.from('payments') as any)
    .update({ status: 'PAID', paid_at: now, updated_at: now })
    .eq('order_id', orderId);

  await (admin.from('orders') as any)
    .update({ status: 'PAID', updated_at: now })
    .eq('id', orderId);

  await (admin.from('order_status_history') as any).insert({
    order_id: orderId,
    from_status: 'PENDING_PAYMENT',
    to_status: 'PAID',
    triggered_by: 'user',
    note: '결제 완료 (mock)',
  });

  return NextResponse.json({
    success: true,
    orderId,
    orderNumber: o.order_number,
  });
}
