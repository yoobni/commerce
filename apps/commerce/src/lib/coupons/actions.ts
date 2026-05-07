'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// coupon_issuances에 UPDATE RLS 정책 없음 → service_role(admin client) 필요
// orderId: 실결제 연동 후 실제 order UUID 전달. 데모 단계에서는 undefined.
export async function markCouponIssuanceUsed(
  issuanceId: string,
  orderId?: string
): Promise<void> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('coupon_issuances')
    .update({
      status: 'USED',
      used_at: new Date().toISOString(),
      ...(orderId ? { used_order_id: orderId } : {}),
    })
    .eq('id', issuanceId)
    .eq('status', 'ISSUED');
}
