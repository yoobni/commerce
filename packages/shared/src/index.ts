/**
 * @commerce/shared — Common Utilities
 */

import type { Currency, Locale } from '@commerce/types';

// ─── Currency Formatting ──────────────────────────────────────────────────────

const CURRENCY_LOCALE_MAP: Record<Currency, string> = {
  KRW: 'ko-KR',
  USD: 'en-US',
  JPY: 'ja-JP',
  EUR: 'de-DE',
};

/**
 * Format a price with the correct locale and currency symbol.
 * KRW and JPY are integer currencies (no decimals).
 */
export function formatPrice(amount: number, currency: Currency): string {
  const locale = CURRENCY_LOCALE_MAP[currency];
  const maximumFractionDigits = currency === 'KRW' || currency === 'JPY' ? 0 : 2;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Get base price from a product for the given currency.
 */
export function getLocalizedPrice(
  prices: {
    base_price_krw: number;
    base_price_usd: number;
    base_price_jpy: number;
    base_price_eur: number;
  },
  currency: Currency
): number {
  switch (currency) {
    case 'KRW': return prices.base_price_krw;
    case 'USD': return prices.base_price_usd;
    case 'JPY': return prices.base_price_jpy;
    case 'EUR': return prices.base_price_eur;
  }
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

const DATE_LOCALE_MAP: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  de: 'de-DE',
};

export function formatDate(isoString: string, locale: Locale): string {
  return new Intl.DateTimeFormat(DATE_LOCALE_MAP[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoString));
}

export function formatDateTime(isoString: string, locale: Locale): string {
  return new Intl.DateTimeFormat(DATE_LOCALE_MAP[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

export function formatRelativeTime(isoString: string, locale: Locale): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  const rtf = new Intl.RelativeTimeFormat(DATE_LOCALE_MAP[locale], { numeric: 'auto' });

  if (minutes < 60) return rtf.format(-minutes, 'minute');
  if (hours < 24) return rtf.format(-hours, 'hour');
  if (days < 30) return rtf.format(-days, 'day');
  return formatDate(isoString, locale);
}

// ─── i18n Helpers ─────────────────────────────────────────────────────────────

type LocalizedFields = {
  name_ko?: string;
  name_en?: string;
  name_ja?: string;
  name_de?: string;
};

/**
 * Pick the localized name field based on current locale, fallback to 'en'.
 */
export function getLocalizedName(obj: LocalizedFields, locale: Locale): string {
  const key = `name_${locale}` as keyof LocalizedFields;
  return obj[key] ?? obj.name_en ?? '';
}

type LocalizedDescriptions = {
  description_ko?: string;
  description_en?: string;
  description_ja?: string;
  description_de?: string;
};

export function getLocalizedDescription(obj: LocalizedDescriptions, locale: Locale): string {
  const key = `description_${locale}` as keyof LocalizedDescriptions;
  return obj[key] ?? obj.description_en ?? '';
}

// ─── URL / Slug ───────────────────────────────────────────────────────────────

export function buildProductUrl(locale: Locale, slug: string): string {
  return `/${locale}/products/${slug}`;
}

export function buildCategoryUrl(locale: Locale, slug: string): string {
  return `/${locale}/collections/${slug}`;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-().]{7,20}$/.test(phone);
}

// ─── Order / Commerce Helpers ─────────────────────────────────────────────────

export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RV-${date}-${suffix}`;
}

/**
 * Calculate coupon discount amount.
 * Respects max_discount_amount cap for PERCENTAGE coupons.
 */
export function calculateCouponDiscount(
  orderTotal: number,
  couponType: 'FIXED_AMOUNT' | 'PERCENTAGE',
  discountValue: number,
  maxDiscountAmount: number | null
): number {
  if (couponType === 'FIXED_AMOUNT') {
    return Math.min(discountValue, orderTotal);
  }
  const calculated = orderTotal * (discountValue / 100);
  return maxDiscountAmount != null ? Math.min(calculated, maxDiscountAmount) : calculated;
}

// ─── String Utilities ─────────────────────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ─── Array Utilities ──────────────────────────────────────────────────────────

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = String(item[key]);
    acc[k] = acc[k] ?? [];
    acc[k].push(item);
    return acc;
  }, {});
}

export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
