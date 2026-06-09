// Server Component. Renders the products linked to a post (post.product_ids)
// — preserves the author's ordering. Empty product list returns null so the
// section disappears entirely.

import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getProductsByIds } from '@/lib/api/products';
import { getProductName, getProductPrice, formatPrice } from '@/lib/format';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';
import type { Locale } from '@commerce/types';

interface MentionedProductsProps {
  productIds: string[];
  locale: Locale;
}

export async function MentionedProducts({ productIds, locale }: MentionedProductsProps) {
  if (!productIds || productIds.length === 0) return null;
  const products = await getProductsByIds(productIds);
  if (products.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'community' });

  return (
    <section
      aria-label={t('relatedProductsTitle')}
      className="pt-8 pb-2 border-t border-[var(--mz-line)]"
    >
      <h2 className="text-eyebrow text-[var(--mz-ink-mute)] mb-4">
        {t('relatedProductsTitle')}
      </h2>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-6 list-none p-0 m-0">
        {products.map((p) => {
          const name = getProductName(p, locale);
          const thumb = safeImageSrc(p.thumbnail_url);
          const price = formatPrice(getProductPrice(p, locale), locale);
          return (
            <li key={p.id}>
              <Link
                href={`/products/${p.slug}`}
                className="group block"
                aria-label={name}
              >
                <div className="relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[var(--mz-bg-deep)]">
                  <Image
                    src={thumb}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 50vw, 220px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    unoptimized={isFallback(thumb)}
                  />
                </div>
                <div className="mt-2">
                  <p className="font-serif text-[14px] font-[500] leading-[18px] text-[var(--mz-ink)] line-clamp-2 group-hover:text-[var(--mz-accent)] transition-colors">
                    {name}
                  </p>
                  <p className="mt-1 text-[12px] font-[600] text-[var(--mz-ink)]">{price}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
