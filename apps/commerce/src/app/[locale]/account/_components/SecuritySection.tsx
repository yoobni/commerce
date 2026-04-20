'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { withdrawAccountAction } from '@/lib/account/actions';
import { analytics } from '@/lib/analytics';

interface Props {
  authUser: User;
}

export function SecuritySection({ authUser }: Props) {
  const t = useTranslations('account.security');
  const tCommon = useTranslations('common');
  const tAuthErr = useTranslations('auth.error');
  const router = useRouter();

  const provider = (authUser.app_metadata?.provider as string | undefined) ?? 'email';
  const isEmailProvider = provider === 'email';

  return (
    <div className="flex flex-col gap-6">
      {/* Password Change */}
      <PasswordChangeForm
        isEmailProvider={isEmailProvider}
        provider={provider}
        t={t}
        tCommon={tCommon}
        tAuthErr={tAuthErr}
      />

      {/* Account Withdrawal */}
      <WithdrawSection
        authUser={authUser}
        t={t}
        tCommon={tCommon}
        router={router}
      />
    </div>
  );
}

// ─── Password Change ──────────────────────────────────────────────────────────

interface PasswordChangeProps {
  isEmailProvider: boolean;
  provider: string;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
  tAuthErr: ReturnType<typeof useTranslations>;
}

function PasswordChangeForm({ isEmailProvider, provider, t, tCommon, tAuthErr }: PasswordChangeProps) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPw.length < 8) {
      setError(tAuthErr('weakPassword'));
      return;
    }
    if (newPw !== confirmPw) {
      setError(tAuthErr('passwordMismatch'));
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    // Re-authenticate with current password for security
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email ?? '',
      password: currentPw,
    });
    if (signInError) {
      setError(tAuthErr('invalidCredentials'));
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      analytics.track('password_change', {});
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-5">
        {t('changePassword')}
      </h2>

      {!isEmailProvider ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('oauthNoPassword', { provider })}
        </p>
      ) : (
        <>
          {success && (
            <div role="status" className="mb-4 px-4 py-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
              {t('changePasswordSuccess')}
            </div>
          )}
          {error && (
            <div role="alert" className="mb-4 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PasswordInput
              label={t('currentPassword')}
              value={currentPw}
              onChange={(e) => { setCurrentPw(e.target.value); setSuccess(false); setError(null); }}
              required
              autoComplete="current-password"
            />
            <PasswordInput
              label={t('newPassword')}
              value={newPw}
              onChange={(e) => { setNewPw(e.target.value); setSuccess(false); setError(null); }}
              required
              autoComplete="new-password"
            />
            <PasswordInput
              label={t('confirmNewPassword')}
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); setSuccess(false); setError(null); }}
              required
              autoComplete="new-password"
            />
            <Button type="submit" size="md" loading={submitting} className="self-start min-w-[140px]">
              {tCommon('save')}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}

// ─── Account Withdrawal ───────────────────────────────────────────────────────

interface WithdrawProps {
  authUser: User;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
  router: ReturnType<typeof useRouter>;
}

function WithdrawSection({ authUser: _, t, tCommon, router }: WithdrawProps) {
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyword = t('withdrawConfirmKeyword');
  const canSubmit = confirmText === keyword;

  async function handleWithdraw(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const result = await withdrawAccountAction();
    if (!result.success) {
      setError(result.error ?? 'error');
      setSubmitting(false);
      return;
    }

    analytics.track('account_withdraw', {});

    // Sign out after withdrawal
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/');
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--color-error)] mb-2">
        {t('withdrawTitle')}
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-5">
        {t('withdrawDescription')}
      </p>

      {error && (
        <div role="alert" className="mb-4 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
        <Input
          label={t('withdrawConfirmLabel')}
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={t('withdrawConfirmPlaceholder')}
          autoComplete="off"
        />
        <Button
          type="submit"
          variant="danger"
          size="md"
          loading={submitting}
          disabled={!canSubmit}
          className="self-start min-w-[140px]"
        >
          {tCommon('confirm')} — {t('withdrawButton')}
        </Button>
      </form>
    </div>
  );
}
