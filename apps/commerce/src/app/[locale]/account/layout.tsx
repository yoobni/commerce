import { getTranslations } from 'next-intl/server';
import { AccountNav } from './_components/AccountNav';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });
  return { title: t('title') };
}

export default async function AccountLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        {/* Mobile nav sits at top */}
        <div className="lg:hidden mb-6">
          <AccountNav />
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <AccountNav />
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
