'use client';

import { useState, FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: authError } = await resetPassword(email, locale);
    if (authError) {
      setError(t('error.generic'));
    } else {
      setSent(true);
    }
    setSubmitting(false);
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
          <div
            role="status"
            className="px-4 py-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm"
          >
            {t('success.resetEmailSent')}
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
          </>
        )}

        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          <Link
            href="/auth/login"
            className="font-medium text-[var(--color-brand-primary)] hover:underline"
          >
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
