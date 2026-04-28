import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('nav');
  const tMeta = await getTranslations('meta');

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] mt-auto">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)] md:px-[var(--container-padding-md)] py-10 md:py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block font-bold text-lg tracking-[0.2em] text-[var(--color-brand-primary)]"
            >
              RAVI
            </Link>
            <p className="text-xs text-[var(--color-text-tertiary)] max-w-[220px] leading-relaxed">
              {tMeta('description')}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                Shop
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {t('shop')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {t('search')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                Community
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/community"
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {t('community')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                Account
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/account"
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {t('account')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {t('cart')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--color-text-tertiary)]">
          <p>
            &copy; {new Date().getFullYear()} {tMeta('siteName')}. All rights reserved.
          </p>
          <p>Premium Large Dog Apparel</p>
        </div>
      </div>
    </footer>
  );
}
