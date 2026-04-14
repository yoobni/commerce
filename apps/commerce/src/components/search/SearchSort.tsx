'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

type SearchSortValue = 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'popular';

interface SearchSortProps {
  currentSort: SearchSortValue;
  labels: {
    sort: string;
    relevance: string;
    newest: string;
    priceAsc: string;
    priceDesc: string;
    popular: string;
  };
}

const OPTIONS: { value: SearchSortValue; labelKey: keyof SearchSortProps['labels'] }[] = [
  { value: 'relevance',  labelKey: 'relevance' },
  { value: 'newest',     labelKey: 'newest'    },
  { value: 'price_asc',  labelKey: 'priceAsc'  },
  { value: 'price_desc', labelKey: 'priceDesc' },
  { value: 'popular',    labelKey: 'popular'   },
];

export function SearchSort({ currentSort, labels }: SearchSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as SearchSortValue;
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'relevance') {
        params.delete('sort');
      } else {
        params.set('sort', value);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="search-sort" className="text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
        {labels.sort}
      </label>
      <select
        id="search-sort"
        value={currentSort}
        onChange={handleChange}
        className="h-9 pl-3 pr-8 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md appearance-none cursor-pointer text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)] focus:border-transparent"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6760' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.6rem center',
        }}
      >
        {OPTIONS.map(({ value, labelKey }) => (
          <option key={value} value={value}>
            {labels[labelKey]}
          </option>
        ))}
      </select>
    </div>
  );
}
