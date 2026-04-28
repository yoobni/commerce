'use client';

import { useState, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { useTrack } from '@/hooks/useTrack';
import { toggleWishlistAction, checkWishlistAction } from '@/lib/wishlist/actions';
import { toggleGuestWishlist, isGuestWishlisted } from '@/lib/wishlist/guest';
import type { Locale } from '@commerce/types';

interface WishlistButtonProps {
  productId: string;
  productName: string;
  price: number;
  category: string;
  locale: Locale;
  isAuthenticated: boolean;
  sourcePage?: 'list' | 'detail' | 'community';
  className?: string;
}

export function WishlistButton({
  productId,
  productName,
  price,
  category,
  isAuthenticated,
  sourcePage = 'detail',
  className,
}: WishlistButtonProps) {
  const t = useTranslations('product');
  const track = useTrack();
  const [isPending, startTransition] = useTransition();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Initialize wishlist state
  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistAction(productId).then(({ isWishlisted: w }) => setIsWishlisted(w));
    } else {
      setIsWishlisted(isGuestWishlisted(productId));
    }
  }, [productId, isAuthenticated]);

  function handleToggle() {
    if (isAuthenticated) {
      startTransition(async () => {
        const result = await toggleWishlistAction(productId);
        if (result.success) {
          setIsWishlisted(result.isWishlisted);
          if (result.isWishlisted) {
            track('wishlist_add', {
              product_id: productId,
              product_name: productName,
              price,
              category,
              source_page: sourcePage,
            });
          } else {
            track('wishlist_remove', { product_id: productId });
          }
        }
      });
    } else {
      const { isWishlisted: next } = toggleGuestWishlist(productId);
      setIsWishlisted(next);
      if (next) {
        track('wishlist_add', {
          product_id: productId,
          product_name: productName,
          price,
          category,
          source_page: sourcePage,
        });
      } else {
        track('wishlist_remove', { product_id: productId });
      }
    }
  }

  const label = isWishlisted ? t('removeFromWishlist') : t('addToWishlist');

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={label}
      aria-pressed={isWishlisted}
      className={cn(
        'flex items-center justify-center gap-2',
        'w-12 h-12 rounded border border-[var(--color-border)]',
        'transition-colors duration-150',
        'hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
        isWishlisted
          ? 'text-red-500 border-red-200 bg-red-50'
          : 'text-[var(--color-text-secondary)] bg-white',
        isPending && 'opacity-60 cursor-wait',
        className
      )}
    >
      <HeartIcon filled={isWishlisted} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
