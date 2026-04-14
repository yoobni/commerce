'use client';

import { useEffect } from 'react';
import { useTrack } from '@/hooks/useTrack';
import type { Product, Locale } from '@commerce/types';
import { getProductName } from '@/lib/format';

interface SearchTrackerProps {
  query: string;
  products: Product[];
  locale: Locale;
}

/**
 * Fires search_result_view analytics event when search results mount.
 * Invisible client component embedded inside the SSR search page.
 */
export function SearchTracker({ query, products, locale }: SearchTrackerProps) {
  const track = useTrack();

  useEffect(() => {
    if (!query) return;
    track('search_result_view', {
      search_query: query,
      result_count: products.length,
      items: products.map((p) => ({
        product_id: p.id,
        product_name: getProductName(p, locale),
        price: p.base_price_krw,
        category: p.category_id,
        image_url: p.thumbnail_url,
      })),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return null;
}
