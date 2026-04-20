'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { Address } from '@commerce/types';
import { Button } from '@/components/ui/Button';
import { deleteAddressAction, setDefaultAddressAction } from '@/lib/account/actions';
import { AddressFormModal } from './AddressFormModal';
import { analytics } from '@/lib/analytics';

interface Props {
  initialAddresses: Address[];
}

export function AddressBook({ initialAddresses }: Props) {
  const t = useTranslations('account.addresses');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [modalAddress, setModalAddress] = useState<Address | null | 'new'>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  function handleAdd() {
    setModalAddress('new');
  }

  function handleEdit(address: Address) {
    setModalAddress(address);
  }

  function handleClose() {
    setModalAddress(null);
  }

  function handleSaved() {
    setModalAddress(null);
    refresh();
  }

  async function handleDelete(address: Address) {
    if (!window.confirm(t('deleteConfirm'))) return;
    setDeletingId(address.id);
    const result = await deleteAddressAction(address.id);
    setDeletingId(null);
    if (result.success) {
      analytics.track('address_delete', {});
      refresh();
    }
  }

  async function handleSetDefault(address: Address) {
    setSettingDefaultId(address.id);
    const result = await setDefaultAddressAction(address.id);
    setSettingDefaultId(null);
    if (result.success) {
      analytics.track('address_set_default', {});
      refresh();
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {t('title')}
          </h2>
          <Button size="sm" variant="secondary" onClick={handleAdd}>
            {t('add')}
          </Button>
        </div>

        {initialAddresses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-secondary)] text-sm">{t('empty')}</p>
            <p className="text-[var(--color-text-tertiary)] text-xs mt-1">{t('emptyDescription')}</p>
            <Button size="sm" variant="secondary" className="mt-4" onClick={handleAdd}>
              {t('add')}
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-4" role="list">
            {initialAddresses.map((addr) => (
              <li
                key={addr.id}
                className="border border-[var(--color-border)] rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {addr.label && (
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {addr.label}
                        </span>
                      )}
                      {addr.is_default && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-neutral-100)] text-[var(--color-brand-primary)]">
                          {t('defaultBadge')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {addr.recipient_name} · {addr.phone}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                      [{addr.postal_code}] {addr.city}{' '}
                      {addr.address_line1}
                      {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{addr.country}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(addr)}
                      className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      {tCommon('edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr)}
                      disabled={deletingId === addr.id}
                      className="text-xs text-[var(--color-error)] hover:opacity-70 transition-opacity disabled:opacity-40"
                    >
                      {tCommon('delete')}
                    </button>
                  </div>
                </div>

                {!addr.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr)}
                    disabled={settingDefaultId === addr.id}
                    className="mt-3 text-xs text-[var(--color-brand-primary)] hover:underline disabled:opacity-40"
                  >
                    {t('setDefault')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {modalAddress !== null && (
        <AddressFormModal
          address={modalAddress === 'new' ? null : modalAddress}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
