import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { WithdrawalForm } from './_components/WithdrawalForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account.withdrawal' });
  return { title: t('title') };
}

export default async function WithdrawalPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'account.withdrawal' });

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t('title')}</h2>
      <WithdrawalForm />
    </div>
  );
}
