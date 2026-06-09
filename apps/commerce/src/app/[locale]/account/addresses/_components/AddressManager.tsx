'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/lib/api/account-client';
import type { Address, Country } from '@commerce/types';

interface AddressManagerProps {
  addresses: Address[];
}

type FormState = {
  mode: 'add' | 'edit';
  address?: Address;
} | null;

const EMPTY_FORM = {
  label: '',
  recipient_name: '',
  phone: '',
  country: 'KR' as Country,
  postal_code: '',
  state_province: '',
  city: '',
  address_line1: '',
  address_line2: '',
  is_default: false,
};

export function AddressManager({ addresses: initial }: AddressManagerProps) {
  const t = useTranslations('account.addresses');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormState({ mode: 'add' });
  }

  function openEdit(addr: Address) {
    setForm({
      label: addr.label ?? '',
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      country: addr.country,
      postal_code: addr.postal_code,
      state_province: addr.state_province ?? '',
      city: addr.city,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 ?? '',
      is_default: addr.is_default,
    });
    setFormState({ mode: 'edit', address: addr });
  }

  function closeForm() {
    setFormState(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = {
      label: form.label || null,
      recipient_name: form.recipient_name,
      phone: form.phone,
      country: form.country,
      postal_code: form.postal_code,
      state_province: form.state_province || null,
      city: form.city,
      address_line1: form.address_line1,
      address_line2: form.address_line2 || null,
      is_default: form.is_default,
    };

    startTransition(async () => {
      if (formState?.mode === 'add') {
        await createAddress(input);
      } else if (formState?.mode === 'edit' && formState.address) {
        await updateAddress(formState.address.id, input);
      }
      closeForm();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm('주소를 삭제하시겠습니까?')) return;
    startTransition(async () => {
      await deleteAddress(id);
      router.refresh();
    });
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      await setDefaultAddress(id);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t('title')}</h2>
        <Button variant="primary" size="sm" onClick={openAdd}>
          + {t('add')}
        </Button>
      </div>

      {/* Address list */}
      {initial.length === 0 && !formState ? (
        <p className="text-sm text-[var(--color-text-secondary)] py-8 text-center">
          {t('noAddresses')}
        </p>
      ) : (
        <div className="space-y-3">
          {initial.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                'rounded-xl border p-4 transition-colors',
                addr.is_default
                  ? 'border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/5'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {addr.label && (
                      <span className="text-xs font-semibold text-[var(--color-brand-accent)]">
                        {addr.label}
                      </span>
                    )}
                    {addr.is_default && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-brand-primary)] text-white font-medium">
                        {t('default')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {t('recipient')}: {addr.recipient_name}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {t('phone')}: {addr.phone}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {addr.postal_code} {addr.address_line1}
                    {addr.address_line2 ? ` ${addr.address_line2}` : ''}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(addr)}>
                    {t('edit')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(addr.id)}
                    disabled={isPending}
                  >
                    {t('delete')}
                  </Button>
                  {!addr.is_default && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={isPending}
                    >
                      {t('setDefault')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit form */}
      {formState && (
        <div className="rounded-xl border border-[var(--color-border)] p-5 bg-[var(--color-surface)] space-y-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {formState.mode === 'add' ? t('add') : t('edit')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="별칭 (선택)"
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              placeholder="집, 회사 등"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('recipient')}
                value={form.recipient_name}
                onChange={(e) => setForm((p) => ({ ...p, recipient_name: e.target.value }))}
                required
              />
              <Input
                label={t('phone')}
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                type="tel"
                required
              />
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <Input
                label="우편번호"
                value={form.postal_code}
                onChange={(e) => setForm((p) => ({ ...p, postal_code: e.target.value }))}
                required
              />
              <Input
                label="주소"
                value={form.address_line1}
                onChange={(e) => setForm((p) => ({ ...p, address_line1: e.target.value }))}
                required
              />
            </div>
            <Input
              label="상세 주소"
              value={form.address_line2}
              onChange={(e) => setForm((p) => ({ ...p, address_line2: e.target.value }))}
              placeholder="동, 호수 등"
            />
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[var(--color-brand-primary)]"
                checked={form.is_default}
                onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))}
              />
              <span className="text-sm text-[var(--color-text-secondary)]">{t('setDefault')}</span>
            </label>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" loading={isPending}>
                저장
              </Button>
              <Button type="button" variant="secondary" onClick={closeForm}>
                취소
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
