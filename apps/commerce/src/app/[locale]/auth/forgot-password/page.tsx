'use client';

import { useState, FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { analytics } from '@/lib/analytics';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/api/auth/callback?next=/${locale}/auth/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setSubmitting(false);

    if (resetError) {
      setError(t('error.generic'));
    } else {
      setSent(true);
      analytics.track('password_reset_request', {});
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)] px-4">
      <div className="w-full max-w-[400px] bg-white rounded-xl border border-[var(--color-border)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-1">
          {t('forgotPasswordTitle')}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8">
          {t('forgotPasswordSubtitle')}
        </p>

        {sent ? (
          <div className="text-center">
            <div
              role="status"
              className="mb-6 px-4 py-4 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm"
            >
              {t('resetLinkSent')}
            </div>
            <Link
              href="/auth/login"
              className="text-sm text-[var(--color-brand-primary)] hover:underline"
            >
              {t('backToLogin')}
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div
                role="alert"
                className="mb-5 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label={t('email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Button type="submit" size="lg" className="w-full" loading={submitting}>
                {t('sendResetLink')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
              <Link
                href="/auth/login"
                className="text-[var(--color-brand-primary)] hover:underline"
              >
                {t('backToLogin')}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
