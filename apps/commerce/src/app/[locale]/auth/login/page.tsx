'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    loading,
    signIn,
    signInWithGoogle,
    signInWithKakao,
    signInWithNaver,
    signInWithTwitter,
  } = useAuth();

  // next-intl's router auto-prefixes the locale, so paths passed in must be
  // locale-relative (e.g. "/" → "/ko/", "/account" → "/ko/account"). Strip an
  // accidental leading locale from `next` to avoid the /ko/ko double-prefix.
  // Match only `/{locale}` exactly or `/{locale}/...` — never `/koalas` etc.
  const rawNext = searchParams.get('next') ?? '/';
  const localePrefix = `/${locale}`;
  const next =
    rawNext === localePrefix
      ? '/'
      : rawNext.startsWith(`${localePrefix}/`)
        ? rawNext.slice(localePrefix.length)
        : rawNext;
  const hasOAuthError = searchParams.get('error') != null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(hasOAuthError ? t('error.generic') : null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(next as Parameters<typeof router.replace>[0]);
    }
  }, [user, loading, router, next]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(t('error.invalidCredentials'));
      setSubmitting(false);
    } else {
      router.replace(next as Parameters<typeof router.replace>[0]);
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

  // Direction B Login spec:
  // Full-height bone-white page. Centered card (max-w 400px).
  // Serif "Welcome back." heading. Floating label inputs. Primary 56px CTA.
  // Muted "Forgot password?" below submit. Divider OR → social ghost buttons.

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[var(--mz-bg)] px-5 py-10">
      <div className="w-full max-w-[400px]">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-serif text-[28px] md:text-[32px] font-[500] leading-[1.12] tracking-[-0.02em] text-[var(--mz-ink)] mb-2">
            {t('loginTitle')}
          </h1>
          <p className="text-[13px] text-[var(--mz-ink-mute)]">{t('loginSubtitle')}</p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-5 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-error)]/20 bg-[var(--color-error)]/5 text-[var(--color-error)] text-[13px]"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            floatingLabel
          />
          <PasswordInput
            label={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            floatingLabel
          />

          <div className="flex justify-center">
            <Link
              href="/auth/forgot-password"
              className="text-[12px] text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            {t('signIn')}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--mz-line)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-[var(--mz-bg)] text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--mz-ink-mute)]">
              {t('or')}
            </span>
          </div>
        </div>

        {/* Social buttons */}
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            fullWidth
            onClick={handleGoogle}
            leadingIcon={<GoogleIcon />}
          >
            {t('continueWithGoogle')}
          </Button>

          {locale === 'ko' && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              fullWidth
              onClick={handleKakao}
              leadingIcon={<KakaoIcon />}
            >
              {t('continueWithKakao')}
            </Button>
          )}

          {locale === 'ja' && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              fullWidth
              onClick={handleNaver}
              leadingIcon={<NaverIcon />}
            >
              {t('continueWithNaver')}
            </Button>
          )}

          {(locale === 'en' || locale === 'de') && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              fullWidth
              onClick={handleTwitter}
              leadingIcon={<TwitterIcon />}
            >
              {t('continueWithTwitter')}
            </Button>
          )}
        </div>

        {/* Sign up link */}
        <p className="mt-7 text-center text-[13px] text-[var(--mz-ink-mute)]">
          {t('noAccount')}{' '}
          <Link
            href="/auth/sign-up"
            className="font-medium text-[var(--mz-ink)] underline underline-offset-2 hover:text-[var(--mz-ink-soft)] transition-colors"
          >
            {t('signUp')}
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
