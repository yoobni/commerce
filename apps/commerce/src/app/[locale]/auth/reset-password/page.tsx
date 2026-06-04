'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { user, loading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Redirect to forgot-password if no recovery session is present
    if (!loading && !user) {
      router.replace('/auth/forgot-password' as Parameters<typeof router.replace>[0]);
    }
  }, [user, loading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t('error.weakPassword'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('error.passwordMismatch'));
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(t('error.generic'));
      setSubmitting(false);
    } else {
      // next-intl router auto-prefixes the locale — pass locale-relative path.
      router.replace('/' as Parameters<typeof router.replace>[0]);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)] px-4">
      <div className="w-full max-w-[400px] bg-white rounded-xl border border-[var(--color-border)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-1">
          {t('resetPasswordTitle')}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8">
          {t('resetPasswordSubtitle')}
        </p>

        {error && (
          <div
            role="alert"
            className="mb-5 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PasswordInput
            label={t('newPassword')}
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
          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            {t('updatePassword')}
          </Button>
        </form>
      </div>
    </div>
  );
}
