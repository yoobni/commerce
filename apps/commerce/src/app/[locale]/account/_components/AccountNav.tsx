'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { href: '/account' as const, key: 'profile' },
  { href: '/account/orders' as const, key: 'orders' },
  { href: '/account/addresses' as const, key: 'addresses' },
  { href: '/account/wishlist' as const, key: 'wishlist' },
  { href: '/account/points' as const, key: 'points' },
] as const;

export function AccountNav() {
  const t = useTranslations('account.nav');
  const pathname = usePathname();

  return (
    <nav aria-label="Account navigation">
      <ul className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
        {NAV_ITEMS.map(({ href, key }) => {
          const active = href === '/account' ? pathname === href : pathname.startsWith(href);
          return (
            <li key={key} className="shrink-0">
              <Link
                href={href}
                className={cn(
                  'flex items-center h-10 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  active
                    ? 'bg-[var(--color-neutral-100)] text-[var(--color-brand-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-50)] hover:text-[var(--color-text-primary)]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
