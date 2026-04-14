'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useCartCount } from '@/components/layout/CartProvider';
import { cn } from '@/lib/cn';

// ─── Inline SVG icons ────────────────────────────────────────────────────────

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconShoppingBag({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ─── Nav items config ─────────────────────────────────────────────────────────

type NavItem = {
  key: 'home' | 'shop' | 'community' | 'cart' | 'account';
  href: string;
  matchPrefix?: string;
};

const MOBILE_NAV_ITEMS: NavItem[] = [
  { key: 'home', href: '/', matchPrefix: '' },
  { key: 'shop', href: '/products', matchPrefix: '/products' },
  { key: 'community', href: '/community', matchPrefix: '/community' },
  { key: 'cart', href: '/cart', matchPrefix: '/cart' },
  { key: 'account', href: '/account', matchPrefix: '/account' },
];

function NavIcon({ navKey, active }: { navKey: NavItem['key']; active: boolean }) {
  const cls = cn('shrink-0 transition-transform', active && 'scale-105');
  switch (navKey) {
    case 'home': return <IconHome className={cls} />;
    case 'shop': return <IconGrid className={cls} />;
    case 'community': return <IconUsers className={cls} />;
    case 'cart': return <IconShoppingBag className={cls} />;
    case 'account': return <IconUser className={cls} />;
  }
}

// ─── MobileNav ───────────────────────────────────────────────────────────────

export function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { cartCount } = useCartCount();

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 md:hidden',
        'bg-[var(--color-surface)] border-t border-[var(--color-border)]',
        'pb-[env(safe-area-inset-bottom)]'
      )}
    >
      <div className="flex items-stretch h-16">
        {MOBILE_NAV_ITEMS.map(({ key, href, matchPrefix }) => {
          const isActive =
            matchPrefix === ''
              ? pathname === '/'
              : pathname.startsWith(matchPrefix ?? href);

          return (
            <Link
              key={key}
              href={href}
              aria-label={key === 'cart' && cartCount > 0 ? `${t(key)} (${cartCount})` : t(key)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1',
                'transition-colors relative',
                isActive
                  ? 'text-[var(--color-brand-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 inset-x-4 h-0.5 bg-[var(--color-brand-primary)] rounded-b-full"
                />
              )}

              {/* Cart badge wrapper */}
              {key === 'cart' ? (
                <span className="relative">
                  <NavIcon navKey={key} active={isActive} />
                  {cartCount > 0 && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5',
                        'flex items-center justify-center',
                        'bg-[var(--color-brand-primary)] text-white text-[10px] font-bold',
                        'rounded-full leading-none'
                      )}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
              ) : (
                <NavIcon navKey={key} active={isActive} />
              )}

              <span className="text-[10px] font-medium leading-none">
                {t(key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
