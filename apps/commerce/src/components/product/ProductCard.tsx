'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';
import { cn } from '@/lib/cn';
import { formatPrice, getProductName, isWithinDays } from '@/lib/format';
import { useTrack } from '@/hooks/useTrack';
import type { Product, Category, Locale } from '@commerce/types';

// ─── Star rating ──────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  if (count === 0) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1 mt-1" aria-label={`Rating: ${rating} out of 5`}>
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill={i < full ? 'currentColor' : i === full && half ? 'url(#half)' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-[var(--color-brand-accent)]"
          >
            {i === full && half && (
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">({count})</span>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ label, variant }: { label: string; variant: 'new' | 'featured' | 'soldout' }) {
  return (
    <span
      className={cn(
        'absolute top-2 left-2 text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded',
        variant === 'new'      && 'bg-[var(--color-brand-primary)] text-white',
        variant === 'featured' && 'bg-[var(--color-brand-accent)] text-[var(--color-brand-primary)]',
        variant === 'soldout'  && 'bg-[var(--color-neutral-300)] text-[var(--color-neutral-700)]'
      )}
    >
      {label}
    </span>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

export interface ProductCardProps {
  product: Product;
  category: Category;
  locale: Locale;
  position: number;
  listName: string;
  newLabel: string;
  featuredLabel: string;
  outOfStockLabel: string;
}

export function ProductCard({
  product,
  category,
  locale,
  position,
  listName,
  newLabel,
  featuredLabel,
  outOfStockLabel,
}: ProductCardProps) {
  const track = useTrack();

  const name = getProductName(product, locale);
  const price = formatPrice(product, locale);
  const isSoldOut = product.status === 'SOLD_OUT';
  const isNew = isWithinDays(product.published_at, 30);

  const href = `/${locale}/products/${product.slug}`;

  const handleClick = useCallback(() => {
    track('product_list_item_click', {
      product_id: product.id,
      product_name: name,
      position,
      list_name: listName,
      price: product.base_price_krw,
      category: category.slug,
    });
  }, [track, product, name, position, listName, category.slug]);

  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        onClick={handleClick}
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)] rounded-md"
        aria-label={name}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-[var(--color-neutral-100)]">
          <Image
            src={product.thumbnail_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover transition-transform duration-500 ease-out',
              'group-hover:scale-105',
              isSoldOut && 'opacity-60'
            )}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlNWUwIi8+PC9zdmc+"
          />

          {/* Badges — only show one: soldout > new > featured */}
          {isSoldOut && <Badge label={outOfStockLabel} variant="soldout" />}
          {!isSoldOut && isNew && <Badge label={newLabel} variant="new" />}
          {!isSoldOut && !isNew && product.is_featured && <Badge label={featuredLabel} variant="featured" />}
        </div>

        {/* Info */}
        <div className="mt-3 flex flex-col">
          <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider truncate">
            {category.name_en}
          </p>
          <h3 className="mt-0.5 text-sm font-medium text-[var(--color-text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--color-brand-primary)] transition-colors">
            {name}
          </h3>
          <StarRating rating={product.review_avg_rating} count={product.review_count} />
          <p className="mt-1.5 text-sm font-semibold text-[var(--color-text-primary)] tabular-nums">
            {price}
          </p>
        </div>
      </Link>
    </article>
  );
}
