'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { getProductName, getProductPrice, formatPrice } from '@/lib/format';
import { WishlistButton } from './WishlistButton';
import { FitBadge } from '@/components/ui/Badge';
import type { Product, Locale } from '@commerce/types';
import { safeImageSrc, isFallback, FALLBACK_THUMB } from '@/lib/images/safeSrc';

// Spec: Direction B — Product Card
// Image block: bgDeep, 1:1 ratio (changed from 3:4), radius 10, relative
// Top-left: accent "★ FIT L" badge (pill, white) — Fit matching products only
// Top-right: heart icon 28×28 circular surface-colored
// Meta: Fraunces 14/500 (name) · Inter 11/400/inkMute (color) · Fraunces 13/600 (price)
// Gap from image to meta: 8px

interface ProductCardProps {
  product: Product;
  locale: Locale;
  isAuthenticated: boolean;
  priority?: boolean;
  className?: string;
  /** Hound's recommended size from Fit-for-Hana profile — shows ★ FIT badge */
  fitSize?: string | null;
}

export function ProductCard({
  product,
  locale,
  isAuthenticated,
  priority = false,
  className,
  fitSize = null,
}: ProductCardProps) {
  const name = getProductName(product, locale);
  const price = getProductPrice(product, locale);
  const formattedPrice = formatPrice(price, locale);
  const isSoldOut = product.status === 'SOLD_OUT';
  const [imgError, setImgError] = useState(false);
  const initial = safeImageSrc(product.thumbnail_url);
  const thumbSrc = imgError ? FALLBACK_THUMB : initial;

  // NEW badge depends on Date.now() vs published_at — server and client
  // resolve at different instants, so deciding during SSR (or eagerly during
  // initial render) leaks a hydration mismatch on items near the 30-day edge.
  // Default to hidden, flip on after mount so the first paint is consistent.
  const [showNew, setShowNew] = useState(false);
  useEffect(() => {
    setShowNew(isNew(product.published_at));
  }, [product.published_at]);

  return (
    <article className={cn('group relative flex flex-col', className)}>
      {/* Card-wide click target. WishlistButton stops propagation, so the
          heart still toggles instead of navigating. */}
      <Link
        href={`/products/${product.slug}`}
        aria-label={name}
        className="absolute inset-0 z-0"
      />

      {/* ── Image container — 1:1 aspect ratio ── */}
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[var(--mz-bg-deep)]">
        <Image
          src={thumbSrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'object-cover transition-transform duration-500',
            !isSoldOut && 'group-hover:scale-[1.03]',
            isSoldOut && 'opacity-60'
          )}
          priority={priority}
          onError={() => setImgError(true)}
          unoptimized={isFallback(thumbSrc)}
        />

        {/* Fit badge — top:8 left:8 per dir-b-ds spec */}
        {fitSize && !isSoldOut && (
          <div className="absolute top-2 left-2 pointer-events-none">
            <FitBadge size={fitSize} />
          </div>
        )}

        {/* New badge — same slot when no Fit badge */}
        {!fitSize && showNew && !isSoldOut && (
          <div className="absolute top-2 left-2 pointer-events-none">
            <span className="inline-flex items-center px-[7px] py-[3px] rounded-[var(--radius-pill)] text-[9px] font-[700] tracking-[0.08em] bg-[var(--mz-ink)] text-[var(--mz-bg)]">
              NEW
            </span>
          </div>
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-end pb-3 justify-center pointer-events-none">
            <span className="px-3 py-1 rounded-[var(--radius-pill)] text-[10px] font-semibold tracking-wide bg-[var(--mz-surface)] text-[var(--mz-ink-mute)] uppercase">
              Sold out
            </span>
          </div>
        )}

        {/* Wishlist button — sits above the absolute Link overlay so taps land
            on the button. Its handler also calls stopPropagation. */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton
            productId={product.id}
            productName={name}
            price={price}
            category={product.category_id}
            locale={locale}
            isAuthenticated={isAuthenticated}
            className="w-7 h-7 shadow-sm rounded-full bg-[var(--mz-surface)]"
          />
        </div>
      </div>

      {/* ── Product meta — gap 8px from image ── */}
      <div className="mt-2 relative">
        <h3
          className={cn(
            'block text-[14px] font-[500] leading-[18px] font-serif',
            'text-[var(--mz-ink)] line-clamp-2',
            'group-hover:text-[var(--mz-ink-soft)] transition-colors duration-150'
          )}
        >
          {name}
        </h3>

        {product.material && (
          <p className="mt-0.5 text-[11px] text-[var(--mz-ink-mute)] truncate">{product.material}</p>
        )}

        <p className="mt-1 text-[13px] font-[600] text-[var(--mz-ink)]">{formattedPrice}</p>

        {product.review_count > 0 && (
          <div
            className="flex items-center gap-1 mt-0.5"
            aria-label={`Rating ${product.review_avg_rating.toFixed(1)} out of 5`}
          >
            <StarIcon />
            <span className="text-[11px] text-[var(--mz-ink-mute)]">
              {product.review_avg_rating.toFixed(1)}
              <span className="ml-0.5">({product.review_count})</span>
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

function isNew(publishedAt: string | null): boolean {
  if (!publishedAt) return false;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(publishedAt).getTime() < THIRTY_DAYS;
}

function StarIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-[var(--mz-accent)]"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
