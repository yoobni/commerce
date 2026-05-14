import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import {
  getPost,
  listComments,
  checkUserLikedPost,
  getUserLikedCommentIds,
} from '@/lib/community/queries';
import { PostDetailContent } from './_components/PostDetailContent';
import { LikeButton } from './_components/LikeButton';
import { CommentSection } from './_components/CommentSection';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const post = await getPost(id);
  return {
    title: post?.title ?? 'Community Post',
    alternates: buildAlternates(`/community/${id}`, locale),
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'community' });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [post, comments] = await Promise.all([getPost(id), listComments(id)]);

  if (!post) notFound();

  const [userLiked, likedCommentIds] = await Promise.all([
    user ? checkUserLikedPost(id, user.id) : Promise.resolve(false),
    user ? getUserLikedCommentIds(id, user.id) : Promise.resolve([]),
  ]);
  const isOwner = user?.id === post.user_id;

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
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
          <PostDetailContent post={post} isOwner={isOwner} locale={locale} />

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
            initialComments={comments}
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
