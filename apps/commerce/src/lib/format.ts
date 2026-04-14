import type { Locale, Product, Category } from '@commerce/types';

// ─── Price ────────────────────────────────────────────────────────────────────

const PRICE_FORMATS: Record<Locale, { locale: string; currency: string; field: keyof Product }> = {
  ko: { locale: 'ko-KR', currency: 'KRW', field: 'base_price_krw' },
  en: { locale: 'en-US', currency: 'USD', field: 'base_price_usd' },
  ja: { locale: 'ja-JP', currency: 'JPY', field: 'base_price_jpy' },
  de: { locale: 'de-DE', currency: 'EUR', field: 'base_price_eur' },
};

export function formatPrice(product: Product, locale: Locale): string {
  const { locale: intlLocale, currency, field } = PRICE_FORMATS[locale] ?? PRICE_FORMATS.en;
  const amount = product[field] as number;
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
  }).format(amount);
}

export function formatRawPrice(amount: number, locale: Locale): string {
  const { locale: intlLocale, currency } = PRICE_FORMATS[locale] ?? PRICE_FORMATS.en;
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
  }).format(amount);
}

// ─── Locale-aware text ────────────────────────────────────────────────────────

export function getProductName(product: Product, locale: Locale): string {
  switch (locale) {
    case 'ko': return product.name_ko;
    case 'en': return product.name_en;
    case 'ja': return product.name_ja;
    case 'de': return product.name_de;
    default:   return product.name_en;
  }
}

export function getCategoryName(category: Category, locale: Locale): string {
  switch (locale) {
    case 'ko': return category.name_ko;
    case 'en': return category.name_en;
    case 'ja': return category.name_ja;
    case 'de': return category.name_de;
    default:   return category.name_en;
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns true if the ISO date string is within the last N days. */
export function isWithinDays(isoDate: string | null, days: number): boolean {
  if (!isoDate) return false;
  return Date.now() - new Date(isoDate).getTime() < days * 86_400_000;
}
