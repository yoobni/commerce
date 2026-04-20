'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { User } from '@supabase/supabase-js';
import type { User as AppUser } from '@commerce/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateProfileAction } from '@/lib/account/actions';
import { analytics } from '@/lib/analytics';

interface Props {
  authUser: User;
  profile: AppUser | null;
}

export function ProfileForm({ authUser, profile }: Props) {
  const t = useTranslations('account.profile');
  const tCommon = useTranslations('common');
  const tAuth = useTranslations('auth');

  const [name, setName] = useState(profile?.name ?? authUser.user_metadata?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [marketing, setMarketing] = useState(profile?.marketing_agreed ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError(null);

    const fieldsChanged: string[] = [];
    if (name !== (profile?.name ?? '')) fieldsChanged.push('name');
    if (phone !== (profile?.phone ?? '')) fieldsChanged.push('phone');
    if (marketing !== (profile?.marketing_agreed ?? false)) fieldsChanged.push('marketing_agreed');

    const result = await updateProfileAction({
      name,
      phone: phone.trim() || null,
      marketing_agreed: marketing,
    });

    setSubmitting(false);
    if (result.success) {
      setSuccess(true);
      if (fieldsChanged.length > 0) {
        analytics.track('profile_update', { fields_changed: fieldsChanged });
      }
    } else {
      setError(result.error ?? 'error');
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
        {t('title')}
      </h2>

      {success && (
        <div
          role="status"
          className="mb-5 px-4 py-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm"
        >
          {t('saveSuccess')}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mb-5 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          value={authUser.email ?? ''}
          readOnly
          hint={t('emailReadOnly')}
        />

        <Input
          label={tAuth('name')}
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setSuccess(false); }}
          placeholder={t('namePlaceholder')}
          required
          autoComplete="name"
        />

        <Input
          label={tCommon('optional')}
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setSuccess(false); }}
          placeholder={t('phonePlaceholder')}
          autoComplete="tel"
        />

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => { setMarketing(e.target.checked); setSuccess(false); }}
            className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-brand-primary)]"
          />
          <span className="text-sm text-[var(--color-text-secondary)]">{t('marketing')}</span>
        </label>

        <Button type="submit" size="md" loading={submitting} className="self-start min-w-[120px]">
          {tCommon('save')}
        </Button>
      </form>
    </div>
  );
}
