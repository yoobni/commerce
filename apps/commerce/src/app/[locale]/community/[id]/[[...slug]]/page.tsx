import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import {
  getPost,
  listComments,
  checkUserLikedPost,
  getUserLikedCommentIds,
  getBlockedUserIds,
} from '@/lib/community/queries';
import { PostDetailContent } from '../_components/PostDetailContent';
import { LikeButton } from '../_components/LikeButton';
import { CommentSection } from '../_components/CommentSection';
import { buildAlternates } from '@/lib/seo/alternates';
import { safeImageSrc } from '@/lib/images/safeSrc';
import { extractExcerpt } from '@/lib/community/excerpt';
import { BlogPostingJsonLd } from '@/components/seo/BlogPostingJsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:4002';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  params: Promise<{ locale: string; id: string; slug?: string[] }>;
};

function canonicalPath(locale: string, shortId: string, slug: string): string {
  return `/${locale}/community/${shortId}/${slug}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const post = await getPost(id);
  if (!post) return { title: 'Community Post' };

  const description = extractExcerpt(post.content, 160);
  const canonical = canonicalPath(locale, post.short_id, post.slug);
  const firstImage = post.images?.[0]?.url ? safeImageSrc(post.images[0].url) : null;
  const ogImages = firstImage ? [{ url: firstImage }] : undefined;

  return {
    title: post.title,
    description,
    alternates: buildAlternates(`/community/${post.short_id}/${post.slug}`, locale),
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `${SITE_URL}${canonical}`,
      images: ogImages,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: post.user?.name ? [post.user.name] : undefined,
    },
    twitter: {
      card: ogImages ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { locale, id, slug: slugSegments } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'community' });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const post = await getPost(id);
  if (!post) notFound();

  // ── Canonical URL enforcement ──────────────────────────────────────────────
  // Three cases that need a redirect to /community/{short_id}/{slug}:
  // 1. id segment was a UUID (legacy URL) → permanent redirect to short_id form
  // 2. id is short_id but slug is missing entirely
  // 3. id is short_id but slug segment(s) don't match canonical slug
  //
  // Done BEFORE the comments/likes fetch so we don't pay for queries that get
  // thrown away on redirect.
  const inputIsUuid = UUID_REGEX.test(id);
  // Next 15 catchall segments arrive percent-encoded — decode so we can
  // compare against the canonical slug stored as decoded UTF-8 in Postgres.
  const incomingSlug =
    slugSegments
      ?.map((s) => {
        try {
          return decodeURIComponent(s);
        } catch {
          return s;
        }
      })
      .join('/') ?? '';
  const canonical = canonicalPath(locale, post.short_id, post.slug);

  if (inputIsUuid) {
    // Note: in Next 15 App Router, layout rendering streams before this point,
    // so the framework falls back to <meta http-equiv="refresh"> instead of an
    // HTTP 308. That's acceptable for SEO because (a) the sitemap only contains
    // canonical URLs and (b) the page metadata sets <link rel="canonical"> to
    // the correct URL. Old UUID URLs (legacy share links) work but are nudged.
    permanentRedirect(canonical);
  }
  if (incomingSlug !== post.slug) {
    redirect(canonical);
  }

  const blockedIds = await getBlockedUserIds(user?.id ?? null);
  const [commentsResult, userLiked, likedCommentIds] = await Promise.all([
    listComments(post.id, 1, undefined, blockedIds),
    user ? checkUserLikedPost(post.id, user.id) : Promise.resolve(false),
    user ? getUserLikedCommentIds(post.id, user.id) : Promise.resolve([]),
  ]);
  const isOwner = user?.id === post.user_id;

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <BlogPostingJsonLd
        post={post}
        url={`${SITE_URL}${canonical}`}
        excerpt={extractExcerpt(post.content, 160)}
      />
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Back */}
        <a
          href={`/${locale}/community`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
        >
          <ChevronLeftIcon />
          {t('title')}
        </a>

        {/* Post */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[var(--color-border-subtle)] mb-6">
          <PostDetailContent
            post={post}
            isOwner={isOwner}
            isAuthenticated={!!user}
            locale={locale}
          />

          {/* Like button */}
          <div className="flex justify-center mt-6 pt-6 border-t border-[var(--color-border-subtle)]">
            <LikeButton
              postId={post.id}
              initialLiked={userLiked}
              initialCount={post.like_count}
              isAuthenticated={!!user}
              locale={locale}
            />
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[var(--color-border-subtle)]">
          <CommentSection
            postId={post.id}
            initialComments={commentsResult.data}
            initialTotal={commentsResult.total}
            initialPage={commentsResult.page}
            initialHasNext={commentsResult.has_next}
            initialLikedCommentIds={likedCommentIds}
            isAuthenticated={!!user}
            currentUserId={user?.id ?? null}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
