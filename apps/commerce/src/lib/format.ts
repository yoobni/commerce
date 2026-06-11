import type { Category, Product, Locale } from '@commerce/types';

// ─── Category ─────────────────────────────────────────────────────────────────

export function getCategoryName(category: Category, locale: Locale): string {
  const map: Record<Locale, string> = {
    ko: category.name_ko,
    en: category.name_en,
    ja: category.name_ja,
    de: category.name_de,
  };
  return map[locale] || category.name_en;
}

// ─── Product name / description ───────────────────────────────────────────────

type LocalizedNameFields = Pick<Product, 'name_ko' | 'name_en' | 'name_ja' | 'name_de'>;
type LocalizedDescFields = Pick<
  Product,
  'description_ko' | 'description_en' | 'description_ja' | 'description_de'
>;

export function getProductName(fields: LocalizedNameFields, locale: Locale): string {
  const map: Record<Locale, string> = {
    ko: fields.name_ko,
    en: fields.name_en,
    ja: fields.name_ja,
    de: fields.name_de,
  };
  return map[locale] || fields.name_en;
}

export function getProductDescription(fields: LocalizedDescFields, locale: Locale): string {
  const map: Record<Locale, string> = {
    ko: fields.description_ko,
    en: fields.description_en,
    ja: fields.description_ja,
    de: fields.description_de,
  };
  return map[locale] || fields.description_en;
}

type LocalizedMaterialFields = Pick<
  Product,
  'material_ko' | 'material_en' | 'material_ja' | 'material_de'
>;

/**
 * Resolve material text for the active locale, falling back through
 * ko → en when the requested locale's column is empty. Returns null when no
 * material has been entered in any locale (caller hides the row).
 */
export function getProductMaterial(
  fields: LocalizedMaterialFields,
  locale: Locale
): string | null {
  const direct =
    locale === 'ko'
      ? fields.material_ko
      : locale === 'en'
        ? fields.material_en
        : locale === 'ja'
          ? fields.material_ja
          : fields.material_de;
  if (direct && direct.trim()) return direct;
  // Fallback chain so a Korean-only entry still shows in en/ja/de pages.
  return fields.material_ko || fields.material_en || null;
}

// ─── Price ────────────────────────────────────────────────────────────────────

type PriceFields = Pick<
  Product,
  'base_price_krw' | 'base_price_usd' | 'base_price_jpy' | 'base_price_eur'
>;

export function getProductPrice(fields: PriceFields, locale: Locale): number {
  const map: Record<Locale, number> = {
    ko: fields.base_price_krw,
    en: fields.base_price_usd,
    ja: fields.base_price_jpy,
    de: fields.base_price_eur,
  };
  return map[locale];
}

const PRICE_FORMAT: Record<Locale, { currency: string; localeStr: string }> = {
  ko: { currency: 'KRW', localeStr: 'ko-KR' },
  en: { currency: 'USD', localeStr: 'en-US' },
  ja: { currency: 'JPY', localeStr: 'ja-JP' },
  de: { currency: 'EUR', localeStr: 'de-DE' },
};

export function formatPrice(amount: number, locale: Locale): string {
  const { currency, localeStr } = PRICE_FORMAT[locale];
  return new Intl.NumberFormat(localeStr, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
  }).format(amount);
}
