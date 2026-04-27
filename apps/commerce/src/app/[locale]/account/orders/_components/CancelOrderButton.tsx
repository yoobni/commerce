'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { cancelOrderAction } from '@/lib/orders/actions';
import type { OrderStatus } from '@commerce/types';

const CANCELLABLE_STATUSES: OrderStatus[] = ['PENDING_PAYMENT', 'PAID', 'PREPARING'];

interface CancelOrderButtonProps {
  orderId: string;
  status: OrderStatus;
}

export function CancelOrderButton({ orderId, status }: CancelOrderButtonProps) {
  const t = useTranslations('account.orders.cancelOrder');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!CANCELLABLE_STATUSES.includes(status)) return null;

  function handleSubmit() {
    startTransition(async () => {
      const res = await cancelOrderAction(orderId, reason || null);
      if (res.success) {
        setMessage({ ok: true, text: t('success') });
        setOpen(false);
        router.refresh();
      } else {
        setMessage({ ok: false, text: t('error') });
      }
    });
  }

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => { setOpen(true); setMessage(null); }}
      >
        {t('button')}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 w-full max-w-sm mx-4 space-y-4 shadow-xl">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              {t('title')}
            </h3>

            {(status === 'PAID' || status === 'PREPARING') && (
              <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-neutral-50)] rounded-lg px-3 py-2 border border-[var(--color-border)]">
                {t('refundNotice')}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                {t('reason')}
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('reasonPlaceholder')}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] resize-none placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 focus:border-[var(--color-brand-primary)]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleSubmit}
                loading={isPending}
              >
                {t('submit')}
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                {t('dismiss')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <p className={`text-sm font-medium ${message.ok ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </>
  );
}
