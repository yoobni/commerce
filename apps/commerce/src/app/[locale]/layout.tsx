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
import { ToastProvider } from '@/components/ui/Toast';
import { buildAlternates } from '@/lib/seo/alternates';
import { fontClassNames } from '../fonts';

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
  const alternates = buildAlternates('/', locale);
  const alternateLocales = routing.locales.filter((l) => l !== locale);

  return {
    title: {
      default: t('title'),
      template: `%s | ${t('siteName')}`,
    },
    description: t('description'),
    openGraph: {
      type: 'website',
      locale,
      alternateLocale: alternateLocales as unknown as string[],
      siteName: t('siteName'),
      images: [
        {
          url: '/og-default.png',
          width: 1200,
          height: 630,
          alt: t('siteName'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-default.png'],
    },
    alternates,
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Pretendard Variable — Korean fallback for Fraunces + Inter */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className={fontClassNames} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale as Locale} messages={messages}>
          <AuthProvider>
            <AnalyticsProvider locale={locale as Locale}>
              <ToastProvider>
                <div className="flex flex-col min-h-screen bg-[var(--mz-bg)]">
                  <Header />
                  {/* pb-14 md:pb-0: clear fixed TabBar on mobile */}
                  <main className="flex-1 pb-14 md:pb-0">{children}</main>
                  <Footer />
                  <TabBar />
                </div>
              </ToastProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
