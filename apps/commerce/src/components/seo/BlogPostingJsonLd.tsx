import type { Post, User } from '@commerce/types';
import { safeImageSrc } from '@/lib/images/safeSrc';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:4002';
const SITE_NAME = 'RAVI';

type PostWithMaybeUser = Omit<Post, 'user'> & {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'> | null;
};

interface Props {
  post: PostWithMaybeUser;
  /** Absolute canonical URL of the post. */
  url: string;
  /** Plain-text excerpt for the description field. */
  excerpt: string;
}

/**
 * BlogPosting structured data for community posts. Server-rendered so crawlers
 * always see it (no JS required).
 *
 * UGC notes:
 *  - author falls back to "익명" when user is absent (deleted/withdrawn);
 *    omitting author entirely makes Google's rich-result validator unhappy.
 *  - image only included when the post has at least one image; rich results
 *    for BlogPosting work without image but show better with it.
 */
export function BlogPostingJsonLd({ post, url, excerpt }: Props) {
  const images = (post.images ?? [])
    .map((img) => safeImageSrc(img.url))
    .filter(Boolean);

  const authorName = post.user?.name ?? '익명';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: excerpt,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    author: { '@type': 'Person', name: authorName },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(images.length > 0 && { image: images }),
    ...(post.like_count > 0 && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: post.like_count,
      },
    }),
    ...(post.comment_count > 0 && { commentCount: post.comment_count }),
  };

  return (
    <script
      type="application/ld+json"
      // Server-rendered string — schema.org JSON-LD is the standard pattern
      // and Next.js docs recommend this exact form.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
