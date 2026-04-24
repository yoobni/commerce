'use client';

import { useState } from 'react';
import { PDPVariantSelector } from '@/components/product/PDPVariantSelector';
import { PDPAddToCart } from '@/components/product/PDPAddToCart';
import { WishlistButton } from '@/components/product/WishlistButton';
import type { ProductOption, Locale } from '@commerce/types';

interface PDPClientProps {
  options: ProductOption[];
  productId: string;
  productName: string;
  productCategory: string;
  price: number;
  locale: Locale;
  isAuthenticated: boolean;
}

export function PDPClient({
  options,
  productId,
  productName,
  productCategory,
  price,
  locale,
  isAuthenticated,
}: PDPClientProps) {
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);

  return (
    <div className="space-y-6">
      {/* Variant selector */}
      <PDPVariantSelector
        options={options}
        productId={productId}
        onSelectionChange={setSelectedOption}
      />

      {/* Add to cart + wishlist */}
      <div className="flex gap-3">
        <div className="flex-1">
          <PDPAddToCart
            selectedOption={selectedOption}
            productId={productId}
            productName={productName}
            productCategory={productCategory}
            price={price}
            locale={locale}
            isAuthenticated={isAuthenticated}
          />
        </div>
        <WishlistButton
          productId={productId}
          productName={productName}
          price={price}
          category={productCategory}
          locale={locale}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
