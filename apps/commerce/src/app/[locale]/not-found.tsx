import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl font-light text-[var(--color-border)] mb-6">404</p>
      <h2 className="text-xl font-semibold mb-2">{t('title')}</h2>
      <p className="text-[var(--color-text-secondary)] mb-8 max-w-sm">
        {t('description')}
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[var(--color-cta)] text-white text-sm font-medium rounded hover:opacity-80 transition-opacity"
      >
        {t('goHome')}
      </Link>
    </div>
  );
}
