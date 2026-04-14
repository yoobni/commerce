'use client';

import { useEffect } from 'react';
import { useTrack } from '@/hooks/useTrack';
import type { Product, Locale } from '@commerce/types';
import { getProductName } from '@/lib/format';

interface PLPTrackerProps {
  products: Product[];
  page: number;
  listName: string;
  locale: Locale;
}

/**
 * Fires product_list_view analytics event when the PLP mounts or products change.
 * Rendered as an invisible client component inside the SSR page.
 */
export function PLPTracker({ products, page, listName, locale }: PLPTrackerProps) {
  const track = useTrack();

  useEffect(() => {
    if (products.length === 0) return;
    track('product_list_view', {
      list_name: listName,
      page_number: page,
      item_count: products.length,
      items: products.map((p) => ({
        product_id: p.id,
        product_name: getProductName(p, locale),
        price: p.base_price_krw,
        category: p.category_id,
        image_url: p.thumbnail_url,
      })),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listName, page]);

  return null;
}
