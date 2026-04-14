'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { useTrack } from '@/hooks/useTrack';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular';

interface ProductSortProps {
  currentSort: SortOption;
  labels: {
    sort: string;
    newest: string;
    priceAsc: string;
    priceDesc: string;
    popular: string;
  };
  listName: string;
}

const OPTIONS: { value: SortOption; labelKey: keyof ProductSortProps['labels'] }[] = [
  { value: 'newest',     labelKey: 'newest'    },
  { value: 'price_asc',  labelKey: 'priceAsc'  },
  { value: 'price_desc', labelKey: 'priceDesc' },
  { value: 'popular',    labelKey: 'popular'   },
];

export function ProductSort({ currentSort, labels, listName }: ProductSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const track = useTrack();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as SortOption;
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', value);
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
      track('sort_change', { sort_by: value, list_name: listName });
    },
    [router, pathname, searchParams, track, listName]
  );

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="plp-sort" className="text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
        {labels.sort}
      </label>
      <select
        id="plp-sort"
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
