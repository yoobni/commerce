'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/Input';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase sets the recovery session when the user lands here via the reset link.
  // We wait for the auth state to reflect a recovery session.
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });
    // Also check immediately in case session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPw.length < 8) {
      setError(t('error.weakPassword'));
      return;
    }
    if (newPw !== confirmPw) {
      setError(t('error.passwordMismatch'));
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      // Sign out so user logs in fresh with new password
      await supabase.auth.signOut();
      router.replace(`/${locale}/auth/login` as Parameters<typeof router.replace>[0]);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)] px-4">
        <p className="text-sm text-[var(--color-text-secondary)] animate-pulse">
          {useTranslations('common')('loading')}…
        </p>
      </div>
    );
  }

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
            label={t('resetPasswordTitle')}
            value={newPw}
            onChange={(e) => { setNewPw(e.target.value); setError(null); }}
            required
            autoComplete="new-password"
          />
          <PasswordInput
            label={t('confirmPassword')}
            value={confirmPw}
            onChange={(e) => { setConfirmPw(e.target.value); setError(null); }}
            required
            autoComplete="new-password"
          />
          <Button type="submit" size="lg" className="w-full mt-1" loading={submitting}>
            {t('updatePassword')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/auth/login" className="text-[var(--color-brand-primary)] hover:underline">
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
