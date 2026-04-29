'use client';

import { useState } from 'react';
import type { Product } from '@commerce/types';
import type { Locale } from '@commerce/types';
import { ProductCard } from './ProductCard';

interface LoadMoreButtonProps {
  initialPage: number;
  totalCount: number;
  perPage: number;
  locale: Locale;
  isAuthenticated: boolean;
  apiParams: Record<string, string>;
  loadMoreLabel: string;
  loadingLabel: string;
}

export function LoadMoreButton({
  initialPage,
  totalCount,
  perPage,
  locale,
  isAuthenticated,
  apiParams,
  loadMoreLabel,
  loadingLabel,
}: LoadMoreButtonProps) {
  const [extraProducts, setExtraProducts] = useState<Product[]>([]);
  const [lastPage, setLastPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);

  const hasMore = lastPage * perPage < totalCount;

  async function loadMore() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const nextPage = lastPage + 1;
      const params = new URLSearchParams({
        ...apiParams,
        page: String(nextPage),
        per_page: String(perPage),
      });
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      setExtraProducts((prev) => [...prev, ...(json.data as Product[])]);
      setLastPage(nextPage);
    } catch {
      // silent — user can retry by clicking again
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {extraProducts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4">
          {extraProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="h-11 px-8 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] text-[13px] font-medium text-[var(--mz-ink)] hover:bg-[var(--mz-bg-deep)] disabled:opacity-50 transition-colors"
          >
            {isLoading ? loadingLabel : loadMoreLabel}
          </button>
        </div>
      )}
    </>
  );
}
