// Server Component. PDP에서 "이 상품이 등장한 커뮤니티 글" 역방향 섹션을 그린다.
// 매칭이 없으면 null 반환 — 섹션 자체가 사라짐.

import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { listPosts } from '@/lib/api/community/posts';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';
import type { Locale } from '@commerce/types';

interface RelatedCommunityPostsProps {
  productId: string;
  locale: Locale;
  /** Default 6 — fits cleanly into a 2×3 or 3×2 grid. */
  limit?: number;
}

export async function RelatedCommunityPosts({
  productId,
  locale,
  limit = 6,
}: RelatedCommunityPostsProps) {
  const result = await listPosts({
    mentionsProductId: productId,
    per_page: limit,
    sort: 'newest',
  });
  if (result.data.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'community' });

  return (
    <section
      aria-label={t('relatedPostsTitle')}
      className="mt-12 md:mt-16 pt-10 border-t border-[var(--mz-line)]"
    >
      <div className="flex items-baseline justify-between gap-3 mb-6">
        <h2 className="font-serif text-[22px] md:text-[26px] font-[500] leading-[1.15] tracking-[-0.02em] text-[var(--mz-ink)]">
          {t('relatedPostsTitle')}
        </h2>
        {result.total > limit && (
          <Link
            href={`/community?mentions_product_id=${productId}`}
            className="text-[12px] font-medium text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] underline underline-offset-4 decoration-[var(--mz-line-strong)] hover:decoration-[var(--mz-accent)]"
          >
            {t('relatedPostsViewAll')}
          </Link>
        )}
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-10 list-none p-0 m-0">
        {result.data.map((post) => {
          const firstImage = post.images?.[0]?.url ? safeImageSrc(post.images[0].url) : null;
          return (
            <li key={post.id}>
              <Link
                href={`/community/${post.short_id}/${post.slug}`}
                className="group block"
                aria-label={post.title}
              >
                <div className="relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[var(--mz-bg-deep)]">
                  {firstImage && (
                    <Image
                      src={firstImage}
                      alt={post.images?.[0]?.alt || post.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      unoptimized={isFallback(firstImage)}
                    />
                  )}
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <p className="font-serif text-[15px] md:text-[17px] font-[500] leading-[1.25] tracking-[-0.01em] text-[var(--mz-ink)] line-clamp-2 group-hover:text-[var(--mz-accent)] transition-colors">
                    {post.title}
                  </p>
                  <p className="text-[11px] text-[var(--mz-ink-mute)] truncate">
                    {post.user?.name ?? ''}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
