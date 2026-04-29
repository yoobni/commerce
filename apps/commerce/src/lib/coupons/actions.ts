'use server';

import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@commerce/types';

export interface CouponValidateResult {
  issuanceId: string;
  discountAmount: number;
  discountText: string;
}

export async function validateCouponCodeAction(
  code: string,
  subtotal: number,
  locale: Locale
): Promise<CouponValidateResult | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const trimmedCode = code.trim().toUpperCase();
  if (!trimmedCode) return { error: '쿠폰 코드를 입력해 주세요.' };

  // Find coupon by code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: coupon } = await (supabase.from('coupons') as any)
    .select('*')
    .eq('code', trimmedCode)
    .single();

  if (!coupon) return { error: '유효하지 않은 쿠폰 코드입니다.' };
  if ((coupon as { status: string }).status !== 'ACTIVE') return { error: '사용 불가한 쿠폰입니다.' };
  if (new Date((coupon as { expires_at: string }).expires_at) < new Date()) {
    return { error: '만료된 쿠폰입니다.' };
  }

  const typedCoupon = coupon as {
    id: string;
    type: 'FIXED_AMOUNT' | 'PERCENTAGE';
    discount_value: number;
    max_discount_amount: number | null;
    min_order_amount: number | null;
  };

  if (typedCoupon.min_order_amount && subtotal < typedCoupon.min_order_amount) {
    return {
      error: `최소 주문 금액 ${typedCoupon.min_order_amount.toLocaleString()}${locale === 'ko' ? '원' : ''} 이상 필요합니다.`,
    };
  }

  // Find ISSUED issuance for this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: issuance } = await (supabase.from('coupon_issuances') as any)
    .select('id, status, expires_at')
    .eq('coupon_id', typedCoupon.id)
    .eq('user_id', user.id)
    .eq('status', 'ISSUED')
    .order('issued_at', { ascending: false })
    .limit(1)
    .single();

  if (!issuance) return { error: '발급받지 않았거나 이미 사용된 쿠폰입니다.' };
  if (new Date((issuance as { expires_at: string }).expires_at) < new Date()) {
    return { error: '쿠폰이 만료되었습니다.' };
  }

  let discountAmount: number;
  let discountText: string;

  if (typedCoupon.type === 'PERCENTAGE') {
    discountAmount = Math.floor(subtotal * (typedCoupon.discount_value / 100));
    if (typedCoupon.max_discount_amount) {
      discountAmount = Math.min(discountAmount, typedCoupon.max_discount_amount);
    }
    discountText = `${typedCoupon.discount_value}% 할인`;
  } else {
    discountAmount = typedCoupon.discount_value;
    discountText = `${discountAmount.toLocaleString()}${locale === 'ko' ? '원' : ''} 할인`;
  }

  return {
    issuanceId: (issuance as { id: string }).id,
    discountAmount,
    discountText,
  };
}
