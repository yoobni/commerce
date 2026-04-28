'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCartCountCache } from '@/lib/cart/guest';
import { cn } from '@/lib/cn';

// Direction B Header spec:
// h-14 (56px). Wordmark: font-serif tracking-[0.14em].
// Mobile: wordmark | [search, bag] — TabBar handles nav.
// Desktop: wordmark | nav links (Inter 13/500) | [search, bag, account]
// Icons: 20px, strokeWidth 1.4, round caps.
// No hamburger — TabBar covers mobile navigation.

const NAV_LINKS = [
  { href: '/products' as const, labelKey: 'shop' },
  { href: '/community' as const, labelKey: 'community' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const { user } = useAuth();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCountCache());

    function handleCartCount(e: Event) {
      setCartCount((e as CustomEvent<number>).detail);
    }
    function handleStorage(e: StorageEvent) {
      if (e.key === 'ravi_cart_count') {
        setCartCount(parseInt(e.newValue ?? '0', 10) || 0);
      }
    }

    window.addEventListener('ravi:cart-count', handleCartCount);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('ravi:cart-count', handleCartCount);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--mz-surface)] border-b border-[var(--mz-line)]">
      <div className="max-w-[var(--container-max)] mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Wordmark — Fraunces via font-serif, tracking wide */}
          <Link
            href="/"
            className="font-serif text-[18px] font-[500] tracking-[0.14em] text-[var(--mz-ink)] hover:opacity-70 transition-opacity"
            aria-label={t('home')}
          >
            RAVI
          </Link>

          {/* Desktop nav — hidden on mobile (TabBar handles it) */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-[13px] font-medium transition-colors duration-150',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'text-[var(--mz-ink)]'
                    : 'text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)]'
                )}
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-0.5">
            <Link
              href="/search"
              aria-label={t('search')}
              className="p-2.5 text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors duration-150 rounded-lg"
            >
              <SearchIcon />
            </Link>

            <Link
              href="/cart"
              aria-label={cartCount > 0 ? `${t('cart')} (${cartCount})` : t('cart')}
              className="relative p-2.5 text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors duration-150 rounded-lg"
            >
              <BagIcon />
              {cartCount > 0 && (
                <span
                  className="absolute top-1 right-1 min-w-[15px] h-[15px] rounded-full bg-[#6B2020] text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none pointer-events-none"
                  aria-hidden="true"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Account — desktop only (TabBar has "Me" tab on mobile) */}
            <Link
              href={user ? '/account' : '/auth/login'}
              aria-label={t('account')}
              className="hidden md:flex p-2.5 text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors duration-150 rounded-lg"
            >
              <AccountIcon />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Icons — 20px grid, 1.4 stroke, round caps ─────────────────────────────────

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
