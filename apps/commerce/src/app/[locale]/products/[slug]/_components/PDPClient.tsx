'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PDPVariantSelector } from '@/components/product/PDPVariantSelector';
import { PDPAddToCart } from '@/components/product/PDPAddToCart';
import { WishlistButton } from '@/components/product/WishlistButton';
import { PDPStickyBar } from './PDPStickyBar';
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
  const t = useTranslations('product');
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [showOptionSheet, setShowOptionSheet] = useState(false);

  function handleSheetSelectionChange(opt: ProductOption | null) {
    setSelectedOption(opt);
    if (opt !== null) setShowOptionSheet(false);
  }

  return (
    <>
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

      {/* Mobile sticky CTA — always visible on mobile, hidden md+ */}
      <PDPStickyBar
        selectedOption={selectedOption}
        price={price}
        locale={locale}
        productId={productId}
        productName={productName}
        productCategory={productCategory}
        isAuthenticated={isAuthenticated}
        onOpenSheet={() => setShowOptionSheet(true)}
      />

      {/* Option selection sheet (mobile only) */}
      {showOptionSheet && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={() => setShowOptionSheet(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('selectOption')}
            className="fixed bottom-0 left-0 right-0 z-[51] bg-white rounded-t-2xl md:hidden"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]">
              <span className="text-[13px] font-semibold">{t('selectOption')}</span>
              <button
                type="button"
                onClick={() => setShowOptionSheet(false)}
                className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
              <PDPVariantSelector
                options={options}
                productId={productId}
                onSelectionChange={handleSheetSelectionChange}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
