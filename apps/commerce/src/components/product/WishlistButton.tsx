'use client';

import { useOptimistic, useTransition } from 'react';
import { cn } from '@/lib/cn';
import { useTrack } from '@/hooks/useTrack';
import { toggleWishlistAction } from '@/app/actions/wishlist';

export interface WishlistButtonProps {
  productId: string;
  productName: string;
  price: number;
  category: string;
  isWishlisted: boolean;
  sourcePosition: number | null;
  sourceSection: 'plp' | 'pdp' | 'wishlist' | 'cart';
  className?: string;
  /** Called after a successful toggle — lets the parent refresh UI if needed */
  onToggled?: (action: 'add' | 'remove') => void;
}

export function WishlistButton({
  productId,
  productName,
  price,
  category,
  isWishlisted,
  sourcePosition,
  sourceSection,
  className,
  onToggled,
}: WishlistButtonProps) {
  const track = useTrack();
  const [, startTransition] = useTransition();
  const [optimisticWishlisted, setOptimisticWishlisted] = useOptimistic(isWishlisted);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const nextAction = optimisticWishlisted ? 'remove' : 'add';

    startTransition(async () => {
      setOptimisticWishlisted(!optimisticWishlisted);

      const result = await toggleWishlistAction(productId);

      if (result.error === 'unauthenticated') {
        // Revert — let the page handle redirect to login
        setOptimisticWishlisted(optimisticWishlisted);
        return;
      }

      if (result.error === 'server_error') {
        setOptimisticWishlisted(optimisticWishlisted);
        return;
      }

      track('wishlist_toggled', {
        product_id: productId,
        product_name: productName,
        price,
        category,
        action: nextAction,
        source_position: sourcePosition,
        source_section: sourceSection,
      });

      onToggled?.(nextAction);
    });
  }

  return (
    <button
      type="button"
      aria-label={optimisticWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={optimisticWishlisted}
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full',
        'bg-white/80 backdrop-blur-sm shadow-sm',
        'transition-transform duration-150 active:scale-90',
        'hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand-accent)]',
        className
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={optimisticWishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={cn(
          'transition-colors duration-150',
          optimisticWishlisted
            ? 'text-[var(--color-brand-primary)]'
            : 'text-[var(--color-neutral-600)]'
        )}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
