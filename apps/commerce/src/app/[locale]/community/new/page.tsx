import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound, redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { PostForm } from './_components/PostForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'community' });
  return { title: t('newTitle') };
}

export default async function NewPostPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [supabase, t] = await Promise.all([
    createClient(),
    getTranslations({ locale, namespace: 'community' }),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/${locale}/community/new`);
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Back */}
        <a
          href={`/${locale}/community`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
        >
          <ChevronLeftIcon />
          {t('title')}
        </a>

        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-8">{t('newTitle')}</h1>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[var(--color-border-subtle)]">
          <PostForm locale={locale} userId={user.id} />
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
