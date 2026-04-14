import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { generateOrderNumber } from '@commerce/shared';
import CheckoutClient, { type CheckoutItem } from './CheckoutClient';
import type { Currency } from '@commerce/types';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });
  return { title: t('title') };
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── 비로그인 사용자 → 로그인 페이지로 리다이렉트 ──────────────────────────────
  // 게스트 체크아웃은 추후 확장 예정; 현재는 회원 전용
  if (!user) {
    redirect(`/${locale}/auth/login?next=/${locale}/checkout`);
  }

  // ── 장바구니 조회 ──────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cartData } = await (supabase.from('carts') as any)
    .select(`
      *,
      items:cart_items(
        *,
        product_option:product_options(
          *,
          product:products(*),
          size:sizes(*)
        )
      )
    `)
    .eq('user_id', user.id)
    .single();

  // 장바구니가 비어있으면 장바구니 페이지로
  if (!cartData || !cartData.items || cartData.items.length === 0) {
    redirect(`/${locale}/cart`);
  }

  const currency = (cartData.currency as Currency) ?? 'KRW';

  // ── CheckoutItem 변환 ─────────────────────────────────────────────────────────
  const priceKey = `base_price_${currency.toLowerCase()}` as const;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: CheckoutItem[] = cartData.items.map((item: any) => {
    const opt = item.product_option;
    const product = opt?.product;
    const size = opt?.size;

    const addlKey = `additional_price_${currency.toLowerCase()}` as const;
    const basePrice: number = product?.[priceKey] ?? 0;
    const addlPrice: number = opt?.[addlKey] ?? 0;
    const unitPrice = basePrice + addlPrice;

    return {
      product_option_id: item.product_option_id,
      product_id: product?.id ?? '',
      product_name: product?.name_en ?? product?.name_ko ?? '',
      sku: opt?.sku ?? '',
      thumbnail_url: product?.thumbnail_url ?? '',
      size: size?.label ?? opt?.size_id ?? '',
      color: opt?.color ?? '',
      unit_price: unitPrice,
      quantity: item.quantity,
    };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const shipping_fee = subtotal >= 100000 ? 0 : 3000; // KRW 기준 10만원 이상 무료배송
  const discount_amount = 0;
  const total_amount = subtotal + shipping_fee - discount_amount;
  const order_number = generateOrderNumber();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileRes = await (supabase.from('users') as any)
    .select('id')
    .eq('id', user.id)
    .single();
  const customerKey: string | null = profileRes.data?.id ?? user.id;

  return (
    <CheckoutClient
      items={items}
      currency={currency}
      subtotal={subtotal}
      shipping_fee={shipping_fee}
      discount_amount={discount_amount}
      total_amount={total_amount}
      order_number={order_number}
      customer_key={customerKey}
      locale={locale}
    />
  );
}
