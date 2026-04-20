'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { key: 'profile', href: '/account/profile' },
  { key: 'addresses', href: '/account/addresses' },
  { key: 'security', href: '/account/security' },
] as const;

export function AccountNav() {
  const t = useTranslations('account.nav');
  const pathname = usePathname();

  return (
    <nav aria-label="Account navigation">
      {/* Mobile: horizontal tabs */}
      <div className="flex overflow-x-auto border-b border-[var(--color-border)] gap-0 lg:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname.includes(item.href);
          return (
            <Link
              key={item.key}
              href={item.href as Parameters<typeof Link>[0]['href']}
              className={cn(
                'flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                active
                  ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </div>

      {/* Desktop: vertical sidebar */}
      <div className="hidden lg:flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.includes(item.href);
          return (
            <Link
              key={item.key}
              href={item.href as Parameters<typeof Link>[0]['href']}
              className={cn(
                'px-4 py-2.5 rounded text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--color-neutral-100)] text-[var(--color-brand-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-50)] hover:text-[var(--color-text-primary)]'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
