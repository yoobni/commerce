'use client';

import { useEffect } from 'react';
import { useTrack } from '@/hooks/useTrack';
import type { ProductWithDetails } from '@commerce/types';
import type { Locale } from '@commerce/types';

interface PDPTrackerProps {
  product: ProductWithDetails;
  locale: Locale;
  communityInflow?: boolean;
}

export function PDPTracker({ product, locale, communityInflow = false }: PDPTrackerProps) {
  const track = useTrack();

  useEffect(() => {
    const priceField =
      locale === 'ko' ? 'base_price_krw'
      : locale === 'ja' ? 'base_price_jpy'
      : locale === 'de' ? 'base_price_eur'
      : 'base_price_usd';

    track('product_detail_view', {
      product_id: product.id,
      product_name: locale === 'ko' ? product.name_ko : product.name_en,
      price: product[priceField] as number,
      category: product.category.slug,
      variant_id: null,
      size: null,
      community_inflow: communityInflow,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return null;
}
