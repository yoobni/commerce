import { createClient } from '@/lib/supabase/server';

export interface CartItemDisplay {
  id: string;
  quantity: number;
  product_option_id: string;
  color: string;
  color_hex: string | null;
  size_label: string | null;
  sku: string;
  stock: number;
  low_stock_threshold: number;
  additional_price_krw: number;
  additional_price_usd: number;
  additional_price_jpy: number;
  additional_price_eur: number;
  product_id: string;
  product_slug: string;
  product_name_ko: string;
  product_name_en: string;
  product_name_ja: string;
  product_name_de: string;
  product_base_price_krw: number;
  product_base_price_usd: number;
  product_base_price_jpy: number;
  product_base_price_eur: number;
  product_thumbnail_url: string;
}

export interface CartDisplay {
  id: string;
  currency: string;
  items: CartItemDisplay[];
}

export async function getCartWithItems(): Promise<CartDisplay | null> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cart } = await (supabase as any)
    .from('carts')
    .select('id, currency')
    .eq('user_id', authData.user.id)
    .single();

  if (!cart) return { id: '', currency: 'KRW', items: [] };

  const cartRow = cart as { id: string; currency: string };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawItems } = await (supabase as any)
    .from('cart_items')
    .select(
      `
      id,
      quantity,
      product_option_id,
      product_options!inner (
        color,
        color_hex,
        sku,
        additional_price_krw,
        additional_price_usd,
        additional_price_jpy,
        additional_price_eur,
        stock,
        low_stock_threshold,
        sizes ( label ),
        products!inner (
          id,
          slug,
          name_ko,
          name_en,
          name_ja,
          name_de,
          base_price_krw,
          base_price_usd,
          base_price_jpy,
          base_price_eur,
          thumbnail_url
        )
      )
    `
    )
    .eq('cart_id', cartRow.id);

  if (!rawItems) return { id: cartRow.id, currency: cartRow.currency, items: [] };

  const items: CartItemDisplay[] = (rawItems as Record<string, unknown>[]).map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opt = row.product_options as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prod = opt.products as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const size = opt.sizes as any;
    return {
      id: row.id as string,
      quantity: row.quantity as number,
      product_option_id: row.product_option_id as string,
      color: opt.color as string,
      color_hex: (opt.color_hex as string | null) ?? null,
      size_label: (size?.label as string | null) ?? null,
      sku: opt.sku as string,
      stock: opt.stock as number,
      low_stock_threshold: opt.low_stock_threshold as number,
      additional_price_krw: opt.additional_price_krw as number,
      additional_price_usd: opt.additional_price_usd as number,
      additional_price_jpy: opt.additional_price_jpy as number,
      additional_price_eur: opt.additional_price_eur as number,
      product_id: prod.id as string,
      product_slug: prod.slug as string,
      product_name_ko: prod.name_ko as string,
      product_name_en: prod.name_en as string,
      product_name_ja: prod.name_ja as string,
      product_name_de: prod.name_de as string,
      product_base_price_krw: prod.base_price_krw as number,
      product_base_price_usd: prod.base_price_usd as number,
      product_base_price_jpy: prod.base_price_jpy as number,
      product_base_price_eur: prod.base_price_eur as number,
      product_thumbnail_url: prod.thumbnail_url as string,
    };
  });

  return { id: cartRow.id, currency: cartRow.currency, items };
}
