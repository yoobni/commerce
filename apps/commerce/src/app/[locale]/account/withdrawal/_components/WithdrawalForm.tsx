'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { withdrawAccountAction } from '@/lib/account/actions';
import { createClient } from '@/lib/supabase/client';

export function WithdrawalForm() {
  const t = useTranslations('account.withdrawal');
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!checked) return;
    setError(null);
    startTransition(async () => {
      const result = await withdrawAccountAction();
      if (!result.success) {
        setError(result.error ?? 'error');
        return;
      }
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace('/');
    });
  }

  return (
    <div className="space-y-6">
      {/* Caution box */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-2">
        <p className="text-sm font-semibold text-red-700">{t('warning')}</p>
        <p className="text-sm text-red-600">{t('caution')}</p>
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-brand-primary)] cursor-pointer"
        />
        <span className="text-sm text-[var(--color-text-primary)]">{t('confirmCheck')}</span>
      </label>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!checked || isPending}
        className="h-11 w-full rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
      >
        {isPending ? t('processing') : t('confirm')}
      </button>
    </div>
  );
}
