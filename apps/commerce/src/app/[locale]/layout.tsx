import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TabBar } from '@/components/layout/TabBar';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: {
      default: t('title'),
      template: `%s | ${t('siteName')}`,
    },
    description: t('description'),
    openGraph: {
      type: 'website',
      locale,
      siteName: t('siteName'),
    },
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale as Locale} messages={messages}>
      <AuthProvider>
        <AnalyticsProvider locale={locale as Locale}>
          <div className="flex flex-col min-h-screen bg-[var(--mz-bg)]">
            <Header />
            {/* pb-14 md:pb-0: clear fixed TabBar on mobile */}
            <main className="flex-1 pb-14 md:pb-0">{children}</main>
            <Footer />
            <TabBar />
          </div>
        </AnalyticsProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
