'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';

export default function SignUpPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const {
    user,
    loading,
    signUp,
    signInWithGoogle,
    signInWithKakao,
    signInWithNaver,
    signInWithTwitter,
  } = useAuth();

  // Normalize `next` to a fully-qualified locale-prefixed path so the router
  // never has to guess. Edge cases:
  //   raw "/ko"     → "/ko/"
  //   raw "/ko/..." → "/ko/..."
  //   raw "/"       → "/{locale}/"
  //   raw "/..."    → "/{locale}/..."
  const rawNext = searchParams.get('next') ?? '/';
  const localePrefix = `/${locale}`;
  const next =
    rawNext === localePrefix
      ? `${localePrefix}/`
      : rawNext.startsWith(`${localePrefix}/`)
        ? rawNext
        : rawNext === '/'
          ? `${localePrefix}/`
          : `${localePrefix}${rawNext.startsWith('/') ? rawNext : `/${rawNext}`}`;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Either router (next-intl wrapper or raw next/navigation) ends up
  // re-prefixing the locale on /ko/auth/sign-up → produces /ko/ko. Bypass
  // the client router and let the browser take the URL verbatim.
  useEffect(() => {
    if (!loading && user) {
      window.location.replace(next);
    }
  }, [user, loading, next]);

  function validate(): string | null {
    if (!name.trim()) return t('error.nameRequired');
    if (password.length < 8) return t('error.weakPassword');
    if (password !== confirmPassword) return t('error.passwordMismatch');
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const { error: authError } = await signUp(email, password, name.trim());
    if (authError) {
      if (authError.toLowerCase().includes('already registered')) {
        setError(t('error.emailInUse'));
      } else {
        setError(t('error.generic'));
      }
      setSubmitting(false);
    } else {
      setSuccessMsg(t('success.signUp'));
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error: authError } = await signInWithGoogle(next);
    if (authError) setError(t('error.generic'));
  }

  async function handleKakao() {
    setError(null);
    const { error: authError } = await signInWithKakao(next);
    if (authError) setError(t('error.generic'));
  }

  async function handleNaver() {
    setError(null);
    const { error: authError } = await signInWithNaver(next);
    if (authError) setError(t('error.generic'));
  }

  async function handleTwitter() {
    setError(null);
    const { error: authError } = await signInWithTwitter(next);
    if (authError) setError(t('error.generic'));
  }

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)] px-4 py-10">
      <div className="w-full max-w-[400px] bg-white rounded-xl border border-[var(--color-border)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-1">
          {t('signUpTitle')}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8">{t('signUpSubtitle')}</p>

        {error && (
          <div
            role="alert"
            className="mb-5 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm"
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="mb-5 px-4 py-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm"
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t('name')}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
          <Input
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <PasswordInput
            label={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <PasswordInput
            label={t('confirmPassword')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
            {t('termsAgreement')}
          </p>

          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            {t('signUp')}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-xs text-[var(--color-text-tertiary)]">
              {t('or')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGoogle}
            leadingIcon={<GoogleIcon />}
          >
            {t('continueWithGoogle')}
          </Button>

          {locale === 'ko' && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleKakao}
              leadingIcon={<KakaoIcon />}
            >
              {t('continueWithKakao')}
            </Button>
          )}

          {locale === 'ja' && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleNaver}
              leadingIcon={<NaverIcon />}
            >
              {t('continueWithNaver')}
            </Button>
          )}

          {(locale === 'en' || locale === 'de') && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleTwitter}
              leadingIcon={<TwitterIcon />}
            >
              {t('continueWithTwitter')}
            </Button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          {t('alreadyHaveAccount')}{' '}
          <Link
            href="/auth/login"
            className="font-medium text-[var(--color-brand-primary)] hover:underline"
          >
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3C6.48 3 2 6.48 2 10.8c0 2.7 1.6 5.07 4.05 6.51L5.1 21l4.77-2.52c.69.1 1.4.15 2.13.15 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"
        fill="#3C1E1E"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#03C75A" />
      <path d="M13.74 12.27L10.1 6H7v12h3.26v-6.27L14 18H17V6h-3.26z" fill="#fff" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill="currentColor"
      />
    </svg>
  );
}
