import { useTranslations } from 'next-intl';

// SSG + ISR — revalidate every hour
export const revalidate = 3600;

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <main>
      <h1>{t('headline')}</h1>
    </main>
  );
}
