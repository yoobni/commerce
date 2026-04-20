'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Address, Country } from '@commerce/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createAddressAction, updateAddressAction, type AddressInput } from '@/lib/account/actions';
import { analytics } from '@/lib/analytics';

const COUNTRIES: { value: Country; label: string }[] = [
  { value: 'KR', label: '한국 (KR)' },
  { value: 'US', label: 'United States (US)' },
  { value: 'JP', label: '日本 (JP)' },
  { value: 'DE', label: 'Deutschland (DE)' },
];

interface Props {
  address: Address | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: AddressInput = {
  label: '',
  recipient_name: '',
  phone: '',
  country: 'KR',
  postal_code: '',
  state_province: '',
  city: '',
  address_line1: '',
  address_line2: '',
  is_default: false,
};

export function AddressFormModal({ address, onClose, onSaved }: Props) {
  const t = useTranslations('account.addresses');
  const tCommon = useTranslations('common');

  const [form, setForm] = useState<AddressInput>(
    address
      ? {
          label: address.label ?? '',
          recipient_name: address.recipient_name,
          phone: address.phone,
          country: address.country,
          postal_code: address.postal_code,
          state_province: address.state_province ?? '',
          city: address.city,
          address_line1: address.address_line1,
          address_line2: address.address_line2 ?? '',
          is_default: address.is_default,
        }
      : EMPTY
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: AddressInput = {
      ...form,
      label: form.label || null,
      state_province: form.state_province || null,
      address_line2: form.address_line2 || null,
    };

    const result = address
      ? await updateAddressAction(address.id, payload)
      : await createAddressAction(payload);

    setSubmitting(false);
    if (result.success) {
      if (address) {
        analytics.track('address_edit', { country: form.country });
      } else {
        analytics.track('address_add', { country: form.country, is_default: form.is_default });
      }
      onSaved();
    } else {
      setError(result.error ?? 'error');
    }
  }

  const isEditing = address !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? t('form.editTitle') : t('form.addTitle')}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-y-auto max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {isEditing ? t('form.editTitle') : t('form.addTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--color-neutral-100)] transition-colors text-[var(--color-text-tertiary)]"
            aria-label={tCommon('close')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div role="alert" className="px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <Input
            label={t('form.label')}
            type="text"
            value={form.label ?? ''}
            onChange={(e) => set('label', e.target.value)}
            placeholder="집, 회사..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('form.recipientName')}
              type="text"
              value={form.recipient_name}
              onChange={(e) => set('recipient_name', e.target.value)}
              required
              autoComplete="name"
            />
            <Input
              label={t('form.phone')}
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              required
              autoComplete="tel"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              {t('form.country')} <span className="text-[var(--color-error)] ml-0.5" aria-hidden="true">*</span>
            </label>
            <select
              value={form.country}
              onChange={(e) => set('country', e.target.value as Country)}
              required
              className="h-11 px-3 rounded border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-base focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('form.postalCode')}
              type="text"
              value={form.postal_code}
              onChange={(e) => set('postal_code', e.target.value)}
              required
              autoComplete="postal-code"
            />
            <Input
              label={t('form.stateProvince')}
              type="text"
              value={form.state_province ?? ''}
              onChange={(e) => set('state_province', e.target.value)}
              autoComplete="address-level1"
            />
          </div>

          <Input
            label={t('form.city')}
            type="text"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            required
            autoComplete="address-level2"
          />

          <Input
            label={t('form.addressLine1')}
            type="text"
            value={form.address_line1}
            onChange={(e) => set('address_line1', e.target.value)}
            required
            autoComplete="address-line1"
          />

          <Input
            label={t('form.addressLine2')}
            type="text"
            value={form.address_line2 ?? ''}
            onChange={(e) => set('address_line2', e.target.value)}
            autoComplete="address-line2"
          />

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => set('is_default', e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-brand-primary)]"
            />
            <span className="text-sm text-[var(--color-text-secondary)]">{t('form.setAsDefault')}</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" size="md" onClick={onClose} className="flex-1">
              {tCommon('cancel')}
            </Button>
            <Button type="submit" size="md" loading={submitting} className="flex-1">
              {tCommon('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
