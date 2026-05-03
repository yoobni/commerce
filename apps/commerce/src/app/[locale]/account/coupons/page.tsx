import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getUserCoupons } from '@/lib/queries/coupons';
import { formatPrice } from '@/lib/format';
import type { CouponIssuanceStatus } from '@commerce/types';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account.coupons' });
  return { title: t('title') };
}

const STATUS_BADGE: Record<
  CouponIssuanceStatus,
  { label: string; className: string }
> = {
  ISSUED: {
    label: 'available',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  USED: {
    label: 'used',
    className: 'bg-neutral-50 text-neutral-500 border-neutral-200',
  },
  EXPIRED: {
    label: 'expired',
    className: 'bg-red-50 text-red-500 border-red-200',
  },
  REVOKED: {
    label: 'expired',
    className: 'bg-red-50 text-red-500 border-red-200',
  },
};

const STATUS_ORDER: CouponIssuanceStatus[] = ['ISSUED', 'USED', 'EXPIRED', 'REVOKED'];

type LocaleNameKey = 'name_ko' | 'name_en' | 'name_ja' | 'name_de';
const LOCALE_NAME_KEY: Record<string, LocaleNameKey> = {
  ko: 'name_ko',
  en: 'name_en',
  ja: 'name_ja',
  de: 'name_de',
};

export default async function CouponsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'account.coupons' });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: issuances } = await getUserCoupons(user.id);

  const nameKey = LOCALE_NAME_KEY[locale] ?? 'name_en';

  // Group by status for display order
  const grouped = STATUS_ORDER.reduce<Record<string, typeof issuances>>(
    (acc, s) => {
      acc[s] = issuances.filter((i) => i.status === s);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {t('title')}
        {issuances.length > 0 && (
          <span className="ml-2 text-[var(--color-text-tertiary)] text-sm font-normal">
            ({issuances.length})
          </span>
        )}
      </h2>

      {issuances.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-16 flex flex-col items-center justify-center text-center">
          <p className="text-4xl mb-3">🎟️</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{t('noCoupons')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {STATUS_ORDER.map((status) => {
            const items = grouped[status] ?? [];
            if (items.length === 0) return null;
            const sectionLabel = status === 'ISSUED' ? t('available') : status === 'USED' ? t('used') : t('expired');
            return (
              <section key={status}>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                  {sectionLabel} ({items.length})
                </h3>
                <ul className="space-y-3">
                  {items.map((issuance) => {
                    const coupon = issuance.coupon;
                    const badge = STATUS_BADGE[issuance.status];
                    const discountLabel =
                      coupon.type === 'PERCENTAGE'
                        ? `${coupon.discount_value}% ${t('discount')}`
                        : `${formatPrice(coupon.discount_value, locale as Locale)} ${t('discount')}`;

                    return (
                      <li
                        key={issuance.id}
                        className={`rounded-xl border bg-[var(--color-surface)] p-5 flex items-start justify-between gap-4 ${
                          issuance.status !== 'ISSUED' ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                            {(coupon as unknown as Record<string, string>)[nameKey] ?? coupon.name_en}
                          </p>
                          <p className="text-base font-bold text-[var(--color-brand-primary)] mt-1">
                            {discountLabel}
                          </p>
                          {coupon.min_order_amount != null && coupon.min_order_amount > 0 && (
                            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                              {t('minOrderAmount')}{' '}
                              {formatPrice(coupon.min_order_amount, locale as Locale)} {t('noMinOrder') === '제한 없음' ? '' : ''}
                            </p>
                          )}
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                            {t('validUntil')}{' '}
                            {new Date(issuance.expires_at).toLocaleDateString(
                              locale === 'ko' ? 'ko-KR' : locale
                            )}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.className}`}
                        >
                          {t(badge.label as 'available' | 'used' | 'expired')}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
