import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound, redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getPost } from '@/lib/community/queries';
import { EditPostForm } from './_components/EditPostForm';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'community' });
  return { title: t('editTitle') };
}

export default async function EditPostPage({ params }: Props) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/${locale}/community/${id}/edit`);
  }

  const post = await getPost(id);
  if (!post) notFound();

  // Only owner can edit
  if (post.user_id !== user.id) {
    redirect(`/${locale}/community/${id}`);
  }

  const t = await getTranslations({ locale, namespace: 'community' });

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Back */}
        <a
          href={`/${locale}/community/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
        >
          <ChevronLeftIcon />
          {post.title}
        </a>

        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-8">
          {t('editTitle')}
        </h1>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[var(--color-border-subtle)]">
          <EditPostForm post={post} locale={locale} />
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
