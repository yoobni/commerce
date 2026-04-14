'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SearchBar } from '@/components/search/SearchBar';
import { cn } from '@/lib/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  locale: string;
}

// ─── Nav links ────────────────────────────────────────────────────────────────

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors whitespace-nowrap',
        active
          ? 'text-[var(--color-text-primary)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
      )}
    >
      {label}
    </Link>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const closeMobileSearch = useCallback(() => setMobileSearchOpen(false), []);

  const navLinks = [
    { href: `/${locale}/products`, labelKey: 'shop' },
    { href: `/${locale}/community`, labelKey: 'community' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-4">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="text-lg font-bold tracking-tight text-[var(--color-text-primary)] shrink-0 mr-4"
            aria-label="RAVI home"
          >
            RAVI
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map(({ href, labelKey }) => (
              <NavLink
                key={href}
                href={href}
                label={t(labelKey)}
                active={pathname.startsWith(href)}
              />
            ))}
          </nav>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <SearchBar
              locale={locale}
              placeholder={t('search')}
              label={t('search')}
            />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Mobile search toggle */}
            <button
              type="button"
              aria-label={t('search')}
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="md:hidden p-2 -m-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Wishlist */}
            <Link
              href={`/${locale}/wishlist`}
              aria-label={t('wishlist')}
              className="p-2 -m-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>

            {/* Cart */}
            <Link
              href={`/${locale}/cart`}
              aria-label={t('cart')}
              className="p-2 -m-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </Link>

            {/* Account */}
            <Link
              href={`/${locale}/auth/login`}
              aria-label={t('account')}
              className="p-2 -m-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-[var(--color-border)]">
          <SearchBar
            locale={locale}
            placeholder={t('search')}
            label={t('search')}
            onClose={closeMobileSearch}
          />
        </div>
      )}
    </header>
  );
}
