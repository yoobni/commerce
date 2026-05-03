'use server';

import { createClient } from '@/lib/supabase/server';
import { validateCouponByCode, type ValidatedCoupon } from './queries';

export async function validateCouponAction(
  code: string,
  orderSubtotal: number
): Promise<{ valid: boolean; coupon?: ValidatedCoupon; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { valid: false, error: 'not_authenticated' };

  return validateCouponByCode(code, user.id, orderSubtotal);
}
