'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { deleteReviewAction } from '@/lib/reviews/actions';

interface Props {
  reviewId: string;
  productSlug: string;
}

export function DeleteReviewButton({ reviewId, productSlug }: Props) {
  const t = useTranslations('account.reviews');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteReviewAction(reviewId, productSlug);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-text-secondary)]">{t('deleteConfirm')}</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {isPending ? '...' : tCommon('delete')}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
        >
          {tCommon('cancel')}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-[var(--color-text-tertiary)] hover:text-red-600 transition-colors"
    >
      {tCommon('delete')}
    </button>
  );
}
