'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics';
import type { Locale, Currency } from '@/lib/analytics/types';

const LOCALE_CURRENCY_MAP: Record<Locale, Currency> = {
  en: 'USD',
  ko: 'KRW',
  ja: 'JPY',
  de: 'EUR',
};

type Props = {
  children: React.ReactNode;
  locale: Locale;
};

export function AnalyticsProvider({ children, locale }: Props) {
  const pathname = usePathname();

  // Initialize analytics on mount
  useEffect(() => {
    const currency = LOCALE_CURRENCY_MAP[locale] ?? 'USD';
    analytics.init({
      locale,
      currency,
      userId: null, // updated after auth
      userType: 'guest',
      country: null, // updated after geo-detection
    });
  }, [locale]);

  // Track page views on route change
  useEffect(() => {
    analytics.page();
  }, [pathname]);

  return <>{children}</>;
}
