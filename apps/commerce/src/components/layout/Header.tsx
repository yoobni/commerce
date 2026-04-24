'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { href: '/products' as const, labelKey: 'shop' },
  { href: '/community' as const, labelKey: 'community' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)] md:px-[var(--container-padding-md)]">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-bold text-xl tracking-[0.2em] text-[var(--color-brand-primary)] hover:opacity-80 transition-opacity"
            aria-label={t('home')}
          >
            RAVI
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors duration-150',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'text-[var(--color-brand-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                )}
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              aria-label={t('search')}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors duration-150"
            >
              <SearchIcon />
            </Link>

            <Link
              href="/wishlist"
              aria-label={t('wishlist')}
              className="hidden sm:flex p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors duration-150"
            >
              <HeartIcon />
            </Link>

            <Link
              href="/cart"
              aria-label={t('cart')}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors duration-150"
            >
              <CartIcon />
            </Link>

            <Link
              href={user ? '/account' : '/auth/login'}
              aria-label={t('account')}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors duration-150"
            >
              <AccountIcon />
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 text-[var(--color-text-secondary)] rounded-lg transition-colors hover:text-[var(--color-text-primary)]"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <nav
            className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)] py-4 flex flex-col gap-1"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMobile}
                className={cn(
                  'px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-[var(--color-neutral-100)] text-[var(--color-brand-primary)]'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)]'
                )}
              >
                {t(labelKey)}
              </Link>
            ))}
            <Link
              href="/wishlist"
              onClick={closeMobile}
              className="px-3 py-3 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              {t('wishlist')}
            </Link>
            <Link
              href={user ? '/account' : '/auth/login'}
              onClick={closeMobile}
              className="px-3 py-3 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              {t('account')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
