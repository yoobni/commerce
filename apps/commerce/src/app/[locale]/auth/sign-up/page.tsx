import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { SignUpForm } from './_components/SignUpForm';

// Server component shell — 같은 이유로 로그인된 유저 → 홈 redirect 는
// server-side `redirect()` 로 처리해 wrapper 의 locale 이중-prefix 위험을
// 제거. 폼 자체는 SignUpForm 으로 분리.

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'auth' });
  return {
    title: t('signUpTitle'),
    robots: { index: false, follow: true },
  };
}

function normalizeNext(rawNext: unknown, locale: string): string {
  const raw = typeof rawNext === 'string' && rawNext.length > 0 ? rawNext : '/';
  const prefix = `/${locale}`;
  if (raw === prefix) return `${prefix}/`;
  if (raw.startsWith(`${prefix}/`)) return raw;
  if (raw === '/') return `${prefix}/`;
  return `${prefix}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

export default async function SignUpPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const next = normalizeNext(sp.next, locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(next);
  }

  return <SignUpForm locale={locale} next={next} />;
}
