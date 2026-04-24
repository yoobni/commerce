'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

// Spec: Direction B — Mobile Tab Bar
// Home · Shop · Search · Saved · Me
// Fixed bottom, 56px height, safe-area-inset-bottom padding
// Active: mz-ink. Inactive: mz-ink-mute
// Bag icon with accent count badge is in Header, NOT here

interface TabBarProps {
  className?: string;
}

interface TabItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  /** Used for prefix matching: /products matches /products/[slug] */
  exactMatch?: boolean;
}

const tabs: TabItem[] = [
  {
    href: '/',
    labelKey: 'Home',
    exactMatch: true,
    icon: <HomeIcon />,
    activeIcon: <HomeIconActive />,
  },
  {
    href: '/products',
    labelKey: 'Shop',
    icon: <ShopIcon />,
    activeIcon: <ShopIconActive />,
  },
  {
    href: '/search',
    labelKey: 'Search',
    icon: <SearchIcon />,
  },
  {
    href: '/account/wishlist',
    labelKey: 'Saved',
    icon: <HeartIcon />,
    activeIcon: <HeartIconActive />,
  },
  {
    href: '/account',
    labelKey: 'Me',
    icon: <PersonIcon />,
    activeIcon: <PersonIconActive />,
  },
];

export function TabBar({ className }: TabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-[var(--mz-surface)] border-t border-[var(--mz-line)]',
        'md:hidden', // tab bar only on mobile
        className
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="flex items-stretch h-14" role="list">
        {tabs.map((tab) => {
          const isActive = tab.exactMatch
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(tab.href + '/');

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href as '/'}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5',
                  'w-full h-full min-w-[44px] min-h-[44px]',
                  'transition-colors duration-150',
                  isActive
                    ? 'text-[var(--mz-ink)]'
                    : 'text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink-soft)]'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span aria-hidden="true">
                  {isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
                </span>
                <span className="text-[10px] font-medium leading-none">{tab.labelKey}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ─── Icons — 24px grid, 1.4 stroke, round caps ───────────────────────────────

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function HomeIconActive() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="var(--mz-surface)" strokeWidth="1.4" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function ShopIconActive() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" stroke="var(--mz-surface)" strokeWidth="1.4" />
      <path d="M16 10a4 4 0 0 1-8 0" fill="none" stroke="var(--mz-surface)" strokeWidth="1.4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function HeartIconActive() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PersonIconActive() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
