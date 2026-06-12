import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './_components/LoginForm';

// Server component shell. Why:
//   - "이미 로그인된 유저 → 홈" 분기는 server-side `redirect()` 로 처리.
//     next/navigation 의 redirect 는 location 헤더로 직접 보내는 server
//     action 이라, next-intl router wrapper 가 끼어들어 /ko/ko 같은
//     locale 이중-prefix 를 만들 여지가 없다.
//   - 클라이언트 form 자체는 LoginForm 으로 분리해 'use client' 경계만
//     유지.

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'auth' });
  return {
    title: t('loginTitle'),
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

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const next = normalizeNext(sp.next, locale);
  const hasOAuthError = typeof sp.error === 'string';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already authenticated → bounce straight to the target. Done in the
  // server so the location header carries the literal URL — no client
  // router wrapper involved.
  if (user) {
    redirect(next);
  }

  return <LoginForm locale={locale} next={next} hasOAuthError={hasOAuthError} />;
}
