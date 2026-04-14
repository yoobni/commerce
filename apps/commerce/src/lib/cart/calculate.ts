import { getLocalizedPrice } from '@commerce/shared';
import type { Currency } from '@commerce/types';
import type { CartLineItem, CartTotals } from './types';

function getOptionAdditionalPrice(
  option: CartLineItem['option'],
  currency: Currency
): number {
  switch (currency) {
    case 'KRW': return option.additional_price_krw;
    case 'USD': return option.additional_price_usd;
    case 'JPY': return option.additional_price_jpy;
    case 'EUR': return option.additional_price_eur;
  }
}

/**
 * Unit price for a single cart line (base + additional).
 */
export function calcItemPrice(
  product: CartLineItem['product'],
  option: CartLineItem['option'],
  currency: Currency
): number {
  return getLocalizedPrice(product, currency) + getOptionAdditionalPrice(option, currency);
}

/**
 * Sum of (unit_price × quantity) for all line items.
 */
export function calcSubtotal(items: CartLineItem[], currency: Currency): number {
  return items.reduce(
    (sum, item) => sum + calcItemPrice(item.product, item.option, currency) * item.quantity,
    0
  );
}

/**
 * Shipping fee: free when subtotal meets threshold.
 */
export function calcShippingFee(
  subtotal: number,
  shippingFee: number,
  freeShippingThreshold: number
): number {
  return subtotal >= freeShippingThreshold ? 0 : shippingFee;
}

/**
 * Full cart totals: subtotal → shipping → discount → total.
 * discount_amount is capped at subtotal (cannot make total negative).
 */
export function calcCartTotals(
  items: CartLineItem[],
  currency: Currency,
  shippingFee: number,
  freeShippingThreshold: number,
  discountAmount = 0
): CartTotals {
  const subtotal = calcSubtotal(items, currency);
  const shipping_fee = calcShippingFee(subtotal, shippingFee, freeShippingThreshold);
  const discount_amount = Math.min(discountAmount, subtotal);
  const total = Math.max(0, subtotal + shipping_fee - discount_amount);
  return { subtotal, shipping_fee, discount_amount, total };
}
