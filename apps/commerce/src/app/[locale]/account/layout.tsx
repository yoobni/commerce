import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/layout/Container';
import { AccountNav } from './_components/AccountNav';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AccountLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/${locale}/account`);
  }

  const t = await getTranslations({ locale, namespace: 'account' });

  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      <Container className="py-8 md:py-12">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
          {t('title')}
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
          <AccountNav />
          <main>{children}</main>
        </div>
      </Container>
    </div>
  );
}
