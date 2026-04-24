import type { Product } from '@commerce/types';
import type { Locale } from '@/i18n/routing';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { getProductName, getProductPrice, formatPrice } from '@/lib/format';
import { cn } from '@/lib/cn';

export interface ProductCardProps {
  product: Product;
  locale: Locale;
  /** Prioritise LCP image (first 2–3 cards above the fold) */
  priority?: boolean;
}

export function ProductCard({ product, locale, priority = false }: ProductCardProps) {
  const tp = useTranslations('plp');
  const tProduct = useTranslations('product');

  const name = getProductName(product, locale);
  const price = getProductPrice(product, locale);
  const priceStr = formatPrice(price, locale);
  const isSoldOut = product.status === 'SOLD_OUT';

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col"
      aria-label={name}
    >
      {/* ── Image ── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-[var(--color-neutral-100)]">
        <Image
          src={product.thumbnail_url}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className={cn(
            'object-cover transition-transform duration-300 group-hover:scale-[1.03]',
            isSoldOut && 'opacity-60'
          )}
          priority={priority}
        />
        {/* ── Badges ── */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isSoldOut && (
            <span className="rounded bg-[var(--color-neutral-600)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              {tProduct('outOfStock')}
            </span>
          )}
          {!isSoldOut && product.is_featured && (
            <span className="rounded bg-[var(--color-brand-accent)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand-primary)]">
              {tp('featured')}
            </span>
          )}
          {!isSoldOut && isNew(product.published_at) && (
            <span className="rounded bg-[var(--color-brand-primary)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              {tp('new')}
            </span>
          )}
        </div>
      </div>

      {/* ── Info ── */}
      <div className="mt-3 flex flex-col gap-0.5">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-[var(--color-text-primary)] group-hover:underline underline-offset-2">
          {name}
        </p>
        <p className={cn(
          'text-sm font-semibold',
          isSoldOut ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'
        )}>
          {priceStr}
        </p>
      </div>
    </Link>
  );
}

function isNew(publishedAt: string | null): boolean {
  if (!publishedAt) return false;
  const diffMs = Date.now() - new Date(publishedAt).getTime();
  return diffMs / (1000 * 60 * 60 * 24) <= 14;
}
