'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { logError } from '@/lib/errors';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  const t = useTranslations('error');

  useEffect(() => {
    logError(error, { context: 'page-level' });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center">
      <p className="text-sm text-[var(--color-text-tertiary)] mb-2">
        {error.digest && `#${error.digest}`}
      </p>
      <h2 className="text-xl font-semibold mb-2">{t('title')}</h2>
      <p className="text-[var(--color-text-secondary)] mb-8 max-w-sm">
        {t('description')}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-[var(--color-cta)] text-white text-sm font-medium rounded hover:opacity-80 transition-opacity"
      >
        {t('retry')}
      </button>
    </div>
  );
}
