'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCartCount } from '@/components/layout/CartProvider';
import { cn } from '@/lib/cn';

// ─── Inline SVG icons ────────────────────────────────────────────────────────

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconShoppingBag({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Desktop nav items ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'shop', href: '/products' },
  { key: 'collections', href: '/collections' },
  { key: 'community', href: '/community' },
  { key: 'about', href: '/about' },
] as const;

// ─── Language selector (desktop dropdown) ────────────────────────────────────

function LanguageDropdown({ currentLocale }: { currentLocale: string }) {
  const t = useTranslations('nav');
  const tLang = useTranslations('languages');
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  function switchLocale(locale: Locale) {
    router.replace(pathname, { locale });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('switchLanguage')}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium',
          'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
          'hover:bg-[var(--color-neutral-100)] transition-colors',
          open && 'bg-[var(--color-neutral-100)] text-[var(--color-text-primary)]'
        )}
      >
        <IconGlobe />
        <span className="uppercase text-xs tracking-wide">{currentLocale}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('switchLanguage')}
          className={cn(
            'absolute right-0 top-full mt-1 z-50 min-w-[9rem]',
            'bg-[var(--color-surface)] border border-[var(--color-border)]',
            'rounded-lg shadow-lg py-1 overflow-hidden'
          )}
        >
          {locales.map((locale) => (
            <button
              key={locale}
              role="option"
              aria-selected={locale === currentLocale}
              onClick={() => switchLocale(locale)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-sm',
                'hover:bg-[var(--color-neutral-50)] transition-colors',
                locale === currentLocale
                  ? 'text-[var(--color-brand-primary)] font-medium'
                  : 'text-[var(--color-text-primary)]'
              )}
            >
              <span>{tLang(locale)}</span>
              {locale === currentLocale && <IconCheck />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Cart badge ───────────────────────────────────────────────────────────────

function CartButton({ label }: { label: string }) {
  const { cartCount } = useCartCount();
  return (
    <Link
      href="/cart"
      aria-label={`${label}${cartCount > 0 ? ` (${cartCount})` : ''}`}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-md',
        'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
        'hover:bg-[var(--color-neutral-100)] transition-colors'
      )}
    >
      <IconShoppingBag />
      {cartCount > 0 && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5',
            'flex items-center justify-center',
            'bg-[var(--color-brand-primary)] text-white text-[10px] font-bold',
            'rounded-full leading-none'
          )}
        >
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  );
}

// ─── Main Header ─────────────────────────────────────────────────────────────

export function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll shadow
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Body scroll lock when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className={cn(
          'fixed top-0 left-1/2 -translate-x-1/2 z-[100]',
          'px-4 py-2 bg-[var(--color-brand-primary)] text-white text-sm font-medium rounded-b-md',
          'opacity-0 pointer-events-none focus:opacity-100 focus:pointer-events-auto',
          'transition-opacity'
        )}
      >
        Skip to content
      </a>

      <header
        className={cn(
          'sticky top-0 z-40',
          'h-14 md:h-16',
          'bg-[var(--color-surface)]',
          'border-b border-[var(--color-border)]',
          'transition-shadow duration-200',
          scrolled && 'shadow-sm'
        )}
      >
        <div className="h-full flex items-center px-[var(--container-padding)] md:px-[var(--container-padding-md)] lg:px-[var(--container-padding-lg)] max-w-[var(--container-max)] mx-auto">

          {/* Mobile: Hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t('menu')}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className={cn(
                'flex items-center justify-center w-10 h-10 -ml-2 rounded-md',
                'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                'hover:bg-[var(--color-neutral-100)] transition-colors'
              )}
            >
              <IconMenu />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-1 flex md:flex-none items-center justify-center md:justify-start">
            <Link
              href="/"
              aria-label="RAVI — Home"
              className="text-xl font-bold tracking-[0.12em] text-[var(--color-brand-primary)] hover:opacity-80 transition-opacity"
            >
              RAVI
            </Link>
          </div>

          {/* Desktop nav */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1 ml-8 flex-1"
          >
            {NAV_ITEMS.map(({ key, href }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={key}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)]'
                  )}
                >
                  {t(key)}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            {/* Search — desktop */}
            <Link
              href="/search"
              aria-label={t('search')}
              className={cn(
                'hidden md:flex items-center justify-center w-10 h-10 rounded-md',
                'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                'hover:bg-[var(--color-neutral-100)] transition-colors'
              )}
            >
              <IconSearch />
            </Link>

            {/* Cart */}
            <CartButton label={t('cart')} />

            {/* Account — desktop */}
            <Link
              href={user ? '/account' : '/auth/login'}
              aria-label={user ? t('myPage') : t('signIn')}
              className={cn(
                'hidden md:flex items-center justify-center w-10 h-10 rounded-md',
                'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                'hover:bg-[var(--color-neutral-100)] transition-colors'
              )}
            >
              <IconUser />
            </Link>

            {/* Language — desktop */}
            <div className="hidden md:block ml-1">
              <LanguageDropdown currentLocale={locale} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        id="mobile-menu"
        aria-hidden={!mobileMenuOpen}
        className={cn(
          'fixed inset-0 z-50 md:hidden',
          'transition-opacity duration-200',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('menu')}
          className={cn(
            'absolute top-0 left-0 bottom-0 w-[min(320px,85vw)]',
            'bg-[var(--color-surface)] flex flex-col',
            'transition-transform duration-250 ease-out',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--color-border)] shrink-0">
            <span className="text-lg font-bold tracking-[0.12em] text-[var(--color-brand-primary)]">
              RAVI
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label={t('closeMenu')}
              className={cn(
                'flex items-center justify-center w-10 h-10 -mr-2 rounded-md',
                'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                'hover:bg-[var(--color-neutral-100)] transition-colors'
              )}
            >
              <IconX />
            </button>
          </div>

          {/* Nav links */}
          <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto py-4">
            {NAV_ITEMS.map(({ key, href }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={key}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center px-5 py-3.5 text-base font-medium',
                    'border-b border-[var(--color-border-subtle)]',
                    'transition-colors',
                    isActive
                      ? 'text-[var(--color-brand-primary)] bg-[var(--color-neutral-50)]'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)]'
                  )}
                >
                  {t(key)}
                </Link>
              );
            })}

            <div className="mt-4 px-5 space-y-1">
              <Link
                href={user ? '/account' : '/auth/login'}
                className={cn(
                  'flex items-center gap-3 px-0 py-3 text-sm',
                  'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                  'transition-colors'
                )}
              >
                <IconUser className="shrink-0" />
                {user ? t('myPage') : t('signIn')}
              </Link>
            </div>
          </nav>

          {/* Language picker */}
          <div className="shrink-0 px-5 py-4 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
              {t('switchLanguage')}
            </p>
            <div className="flex flex-wrap gap-2">
              {locales.map((loc) => (
                <MobileLocaleSwitcher
                  key={loc}
                  locale={loc}
                  currentLocale={locale}
                  pathname={pathname}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Mobile locale switcher button ───────────────────────────────────────────

function MobileLocaleSwitcher({
  locale,
  currentLocale,
  pathname,
}: {
  locale: Locale;
  currentLocale: string;
  pathname: string;
}) {
  const tLang = useTranslations('languages');
  const router = useRouter();

  return (
    <button
      onClick={() => router.replace(pathname, { locale })}
      aria-pressed={locale === currentLocale}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
        locale === currentLocale
          ? 'bg-[var(--color-brand-primary)] text-white'
          : 'bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-200)]'
      )}
    >
      {tLang(locale)}
    </button>
  );
}
