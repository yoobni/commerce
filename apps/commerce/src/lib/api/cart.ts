import { apiGetOne } from './client';
import { getAccessToken } from './auth';

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

const EMPTY_CART: CartDisplay = { id: '', currency: 'KRW', items: [] };

/**
 * Server-side: returns the authenticated viewer's cart, or an empty cart
 * (so server components can render the "empty" state without branching).
 */
export async function getCartWithItems(): Promise<CartDisplay | null> {
  const accessToken = (await getAccessToken()) ?? undefined;
  if (!accessToken) return null;
  return apiGetOne<CartDisplay>('/cart/me', { accessToken, noStore: true });
}

export { EMPTY_CART };
