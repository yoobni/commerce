'use client';

import { useEffect } from 'react';
import { useTrack } from '@/hooks/useTrack';
import type { Locale } from '@commerce/types';

interface PDPTrackerProps {
  productId: string;
  productName: string;
  price: number;
  category: string;
  locale: Locale;
}

/**
 * Fires product_detail_view analytics event once on mount.
 * Renders nothing — purely a side-effect component.
 */
export function PDPTracker({ productId, productName, price, category, locale }: PDPTrackerProps) {
  const track = useTrack();

  useEffect(() => {
    track('product_detail_view', {
      product_id: productId,
      product_name: productName,
      price,
      category,
      variant_id: null,
      size: null,
      community_inflow: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]); // fire once per product page

  return null;
}
