'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateProfileAction } from '@/lib/account/actions';
import type { User } from '@commerce/types';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations('account.profile');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [marketing, setMarketing] = useState(user.marketing_agreed);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProfileAction({
        name,
        phone: phone || null,
        marketing_agreed: marketing,
      });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <Input
        label={t('name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
          {t('email')}
        </label>
        <p className="h-10 flex items-center px-3 rounded-lg bg-[var(--color-neutral-50)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
          {user.email}
        </p>
      </div>
      <Input
        label={t('phone')}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t('phonePlaceholder')}
        type="tel"
      />
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
          />
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${marketing ? 'bg-[var(--color-brand-primary)] border-[var(--color-brand-primary)]' : 'border-[var(--color-border)] group-hover:border-[var(--color-brand-primary)]/50'}`}>
            {marketing && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {t('marketingConsent')}
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" variant="primary" loading={isPending}>
          {t('save')}
        </Button>
        {saved && (
          <p className="text-sm text-green-600 font-medium">
            {t('updated')}
          </p>
        )}
      </div>
    </form>
  );
}
