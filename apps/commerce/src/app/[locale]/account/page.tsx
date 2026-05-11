import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/account/queries';
import { ProfileForm } from './_components/ProfileForm';
import { FitForHanaCard } from '@/components/ui/FitForHanaCard';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account.profile' });
  return { title: t('title') };
}

export default async function AccountProfilePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'account.profile' });

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) notFound();

  const profile = await getUserProfile(authUser.id);
  if (!profile) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t('title')}</h2>
      {/* Fit-for-Hana — 하운드 서머리 상단 */}
      <FitForHanaCard profile={null} setupHref="/onboarding" />
      <ProfileForm user={profile} />
    </div>
  );
}
