'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { PostWithUser } from '@/lib/api/community/posts';
import type { BoardType } from '@commerce/types';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';

// Spec: mirrors Direction B ProductCard.
// Image-as-card: 1:1 image with bgDeep, rounded-md; meta flows below at mt-2.
// No card border, no card shadow, no card background — page bg shows through.
// Title in Fraunces serif (font-serif). Mono-tone badges per dir-b restraint.

interface PostCardProps {
  post: PostWithUser;
  locale: string;
  priority?: boolean;
}

const BOARD_LABEL_KEYS: Record<BoardType, string> = {
  DAILY: 'boardDaily',
  STYLE: 'boardStyle',
  TIP: 'boardTip',
  QUESTION: 'boardQuestion',
};

export function PostCard({ post, locale, priority = false }: PostCardProps) {
  const t = useTranslations('community');
  const firstImage = post.images?.[0]?.url ? safeImageSrc(post.images[0].url) : null;
  const firstImageAlt = post.images?.[0]?.alt || post.title;
  const href = `/${locale}/community/${post.short_id}/${post.slug}`;

  return (
    <article className="group relative flex flex-col">
      {/* ── Image — 1:1, bgDeep, radius md ── */}
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[var(--mz-bg-deep)]">
        <Link href={href} className="block w-full h-full" aria-label={post.title}>
          {firstImage ? (
            <Image
              src={firstImage}
              alt={firstImageAlt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={priority}
              unoptimized={isFallback(firstImage)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <PlaceholderMark />
            </div>
          )}
        </Link>

        {/* Board label — top-left, mono pill (ink/bg) per NEW badge pattern */}
        <span className="absolute top-2 left-2 inline-flex items-center px-2 py-[3px] rounded-[var(--radius-pill)] text-[10px] font-[700] tracking-[0.08em] bg-[var(--mz-ink)] text-[var(--mz-bg)] uppercase">
          {t(BOARD_LABEL_KEYS[post.board_type])}
        </span>

        {/* Pinned — top-right, small accent dot */}
        {post.is_pinned && (
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--mz-accent)]"
            aria-label={t('pinned')}
            title={t('pinned')}
          />
        )}

        {/* Multi-image indicator — bottom-right, surface pill */}
        {post.images && post.images.length > 1 && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-[7px] py-[3px] rounded-[var(--radius-pill)] text-[10px] font-medium bg-[var(--mz-surface)] text-[var(--mz-ink-soft)]">
            <MultiImageMark />
            {post.images.length}
          </span>
        )}
      </div>

      {/* ── Meta — gap 12px from image, no padding ── */}
      <div className="mt-3 flex flex-col gap-2">
        {/* Dog breed — soft secondary line with the familiar paw glyph */}
        {post.dog_breed && (
          <p className="text-[12px] md:text-[13px] font-medium text-[var(--mz-ink-soft)] truncate">
            🐾 {post.dog_breed}
          </p>
        )}

        {/* Title — Fraunces serif, larger on desktop so the card reads as an article */}
        <Link
          href={href}
          className="block font-serif text-[16px] md:text-[18px] font-[500] leading-[1.25] tracking-[-0.01em] text-[var(--mz-ink)] line-clamp-2 hover:text-[var(--mz-accent)] transition-colors duration-150"
        >
          {post.title}
        </Link>

        {/* Author + stats row */}
        <div className="flex items-center justify-between gap-2 text-[12px] text-[var(--mz-ink-mute)]">
          <div className="flex items-center gap-1.5 min-w-0">
            {post.user?.profile_image_url ? (
              <Image
                src={safeImageSrc(post.user.profile_image_url)}
                alt={post.user.name}
                width={20}
                height={20}
                className="w-5 h-5 rounded-full shrink-0 object-cover"
                unoptimized={isFallback(safeImageSrc(post.user.profile_image_url))}
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[var(--mz-bg-deep)] shrink-0" />
            )}
            <span className="truncate text-[var(--mz-ink-soft)]">{post.user?.name ?? ''}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 tabular-nums">
            <span className="inline-flex items-center gap-1">
              <HeartMark />
              {post.like_count}
            </span>
            <span className="inline-flex items-center gap-1">
              <CommentMark />
              {post.comment_count}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function PlaceholderMark() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[var(--mz-line-strong)]"
      aria-hidden="true"
    >
      <path d="M3 8 L 12 3 L 21 8 L 21 20 L 3 20 Z" />
      <path d="M9 14 Q 12 11, 15 14" />
    </svg>
  );
}

function HeartMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentMark() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MultiImageMark() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
