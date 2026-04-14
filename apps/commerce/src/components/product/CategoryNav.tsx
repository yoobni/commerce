'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { cn } from '@/lib/cn';
import type { Category, Locale } from '@commerce/types';

function getCategoryName(cat: Category, locale: Locale): string {
  switch (locale) {
    case 'ko': return cat.name_ko;
    case 'en': return cat.name_en;
    case 'ja': return cat.name_ja;
    case 'de': return cat.name_de;
    default:   return cat.name_en;
  }
}

interface CategoryNavProps {
  categories: Category[];
  currentCategory: string | null;
  allLabel: string;
  locale: Locale;
}

export function CategoryNav({ categories, currentCategory, allLabel, locale }: CategoryNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set('category', slug);
      } else {
        params.delete('category');
      }
      // Reset to page 1 when category changes
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const tabs = [
    { slug: null, label: allLabel },
    ...categories.map((cat) => ({ slug: cat.slug, label: getCategoryName(cat, locale) })),
  ];

  return (
    <nav
      className="flex gap-1 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1"
      aria-label="Product categories"
    >
      {tabs.map(({ slug, label }) => {
        const isActive = slug === null ? !currentCategory : currentCategory === slug;
        return (
          <button
            key={slug ?? '__all__'}
            type="button"
            onClick={() => handleSelect(slug)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'shrink-0 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap',
              'transition-colors duration-150',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
              isActive
                ? 'bg-[var(--color-brand-primary)] text-white'
                : 'bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-200)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
