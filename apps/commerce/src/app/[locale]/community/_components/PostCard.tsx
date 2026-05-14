'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { PostWithUser } from '@/lib/community/queries';
import type { BoardType } from '@commerce/types';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';

interface PostCardProps {
  post: PostWithUser;
  locale: string;
}

const BOARD_LABELS: Record<BoardType, string> = {
  DAILY: 'boardDaily',
  STYLE: 'boardStyle',
  TIP: 'boardTip',
  QUESTION: 'boardQuestion',
};

const BOARD_COLORS: Record<BoardType, string> = {
  DAILY: 'bg-amber-100 text-amber-800',
  STYLE: 'bg-rose-100 text-rose-800',
  TIP: 'bg-emerald-100 text-emerald-800',
  QUESTION: 'bg-blue-100 text-blue-800',
};

export function PostCard({ post, locale }: PostCardProps) {
  const t = useTranslations('community');
  const firstImage = post.images?.[0] ? safeImageSrc(post.images[0]) : null;

  return (
    <Link
      href={`/${locale}/community/${post.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-[var(--color-border-subtle)]"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-[var(--color-neutral-100)] overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized={isFallback(firstImage)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <DogPlaceholderIcon />
          </div>
        )}

        {/* Board badge */}
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold ${BOARD_COLORS[post.board_type]}`}
        >
          {t(BOARD_LABELS[post.board_type])}
        </span>

        {/* Pinned badge */}
        {post.is_pinned && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-brand-accent)] text-[var(--color-brand-primary)]">
            {t('pinned')}
          </span>
        )}

        {/* Multiple images indicator */}
        {post.images && post.images.length > 1 && (
          <span className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/50 text-white rounded px-1.5 py-0.5 text-xs">
            <MultiImageIcon />
            {post.images.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Dog breed */}
        {post.dog_breed && (
          <p className="text-xs text-[var(--color-brand-secondary)] font-medium mb-1">
            🐾 {post.dog_breed}
          </p>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2 leading-snug mb-3">
          {post.title}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2 min-w-0">
            {post.user?.profile_image_url ? (
              <Image
                src={safeImageSrc(post.user.profile_image_url)}
                alt={post.user.name}
                width={20}
                height={20}
                className="rounded-full shrink-0 object-cover"
                unoptimized={isFallback(safeImageSrc(post.user.profile_image_url))}
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[var(--color-neutral-200)] shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-[var(--color-text-tertiary)]">
                  {post.user?.name?.charAt(0) ?? '?'}
                </span>
              </div>
            )}
            <span className="text-xs text-[var(--color-text-secondary)] truncate">
              {post.user?.name ?? ''}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)] shrink-0 ml-2">
            <span className="flex items-center gap-0.5">
              <HeartIcon />
              {post.like_count}
            </span>
            <span className="flex items-center gap-0.5">
              <CommentIcon />
              {post.comment_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DogPlaceholderIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-[var(--color-neutral-300)]"
      aria-hidden="true"
    >
      <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2 .336-3.5 2.093-3.5 4 0 .748.212 1.446.586 2.032A4.987 4.987 0 0 0 3 11v2a8 8 0 1 0 16 0v-2c0-1.077-.33-2.073-.893-2.893" />
      <path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2 .336 3.5 2.093 3.5 4 0 .748-.212 1.446-.586 2.032" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MultiImageIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
