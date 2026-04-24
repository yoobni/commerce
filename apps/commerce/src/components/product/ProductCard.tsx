'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { getProductName, getProductPrice, formatPrice } from '@/lib/format';
import { WishlistButton } from './WishlistButton';
import type { Product, Locale } from '@commerce/types';

interface ProductCardProps {
  product: Product;
  locale: Locale;
  isAuthenticated: boolean;
  priority?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  locale,
  isAuthenticated,
  priority = false,
  className,
}: ProductCardProps) {
  const name = getProductName(product, locale);
  const price = getProductPrice(product, locale);
  const formattedPrice = formatPrice(price, locale);

  return (
    <article className={cn('group relative flex flex-col', className)}>
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[var(--color-neutral-100)]">
        <Link href={`/products/${product.slug}`} className="block w-full h-full" aria-label={name}>
          <Image
            src={product.thumbnail_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
          {product.is_featured && (
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-[var(--color-brand-accent)] text-[var(--color-brand-primary)]">
              FEATURED
            </span>
          )}
          {isNew(product.published_at) && (
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-[var(--color-brand-primary)] text-white">
              NEW
            </span>
          )}
          {product.status === 'SOLD_OUT' && (
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-[var(--color-neutral-700)] text-white">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <div className="absolute top-2.5 right-2.5">
          <WishlistButton
            productId={product.id}
            productName={name}
            price={price}
            category={product.category_id}
            locale={locale}
            isAuthenticated={isAuthenticated}
            className="w-9 h-9 shadow-sm"
          />
        </div>
      </div>

      {/* Product info */}
      <div className="mt-3 flex flex-col gap-0.5">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 hover:text-[var(--color-brand-primary)] transition-colors"
        >
          {name}
        </Link>
        <p className="text-sm text-[var(--color-text-secondary)]">{formattedPrice}</p>
        {product.review_count > 0 && (
          <div className="flex items-center gap-1 mt-0.5" aria-label={`Rating ${product.review_avg_rating.toFixed(1)} out of 5`}>
            <StarIcon />
            <span className="text-xs text-[var(--color-text-tertiary)]">
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
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-brand-accent)]" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
