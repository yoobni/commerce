'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics';
import { useAuth } from '@/components/providers/AuthProvider';
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
  const { user } = useAuth();

  // Initialize analytics on mount / locale change
  useEffect(() => {
    const currency = LOCALE_CURRENCY_MAP[locale] ?? 'USD';
    analytics.init({
      locale,
      currency,
      userId: null,
      userType: 'guest',
      country: null,
    });
  }, [locale]);

  // Update userId/userType when auth state changes
  useEffect(() => {
    analytics.setUser(
      user ? user.id : null,
      user ? 'member' : 'guest',
    );
  }, [user]);

  // Track page views on route change
  useEffect(() => {
    analytics.page();
  }, [pathname]);

  return <>{children}</>;
}
