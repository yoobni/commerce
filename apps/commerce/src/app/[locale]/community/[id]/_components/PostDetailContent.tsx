'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { deletePostAction } from '@/lib/community/actions';
import type { PostWithUser } from '@/lib/community/queries';
import type { BoardType } from '@commerce/types';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';

const BOARD_COLORS: Record<BoardType, string> = {
  DAILY: 'bg-amber-100 text-amber-800',
  STYLE: 'bg-rose-100 text-rose-800',
  TIP: 'bg-emerald-100 text-emerald-800',
  QUESTION: 'bg-blue-100 text-blue-800',
};

const BOARD_LABEL_KEYS: Record<BoardType, string> = {
  DAILY: 'boardDaily',
  STYLE: 'boardStyle',
  TIP: 'boardTip',
  QUESTION: 'boardQuestion',
};

interface PostDetailContentProps {
  post: PostWithUser;
  isOwner: boolean;
  locale: string;
}

export function PostDetailContent({ post, isOwner, locale }: PostDetailContentProps) {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const images = (post.images ?? []).map(safeImageSrc);

  async function handleDelete() {
    if (!window.confirm(t('deletePostConfirm'))) return;
    setIsDeleting(true);
    const result = await deletePostAction(post.id);
    setIsDeleting(false);
    if (result.success) {
      router.push(`/${locale}/community`);
    }
  }

  return (
    <article>
      {/* Board badge + pinned */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${BOARD_COLORS[post.board_type]}`}
        >
          {t(BOARD_LABEL_KEYS[post.board_type])}
        </span>
        {post.is_pinned && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-brand-accent)] text-[var(--color-brand-primary)]">
            {t('pinned')}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] leading-snug mb-4">
        {post.title}
      </h1>

      {/* Meta row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {post.user?.profile_image_url ? (
            <Image
              src={safeImageSrc(post.user.profile_image_url)}
              alt={post.user.name}
              width={36}
              height={36}
              className="rounded-full object-cover"
              unoptimized={isFallback(safeImageSrc(post.user.profile_image_url))}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--color-neutral-200)] flex items-center justify-center text-sm font-medium text-[var(--color-text-secondary)]">
              {post.user?.name?.charAt(0) ?? '?'}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {post.user?.name ?? ''}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {formatDate(post.created_at)}
            </p>
          </div>
        </div>

        {/* Dog breed */}
        {post.dog_breed && (
          <span className="text-xs text-[var(--color-brand-secondary)] font-medium bg-[var(--color-neutral-50)] px-3 py-1 rounded-full border border-[var(--color-border)]">
            🐾 {post.dog_breed}
          </span>
        )}
      </div>

      {/* Image gallery */}
      {images.length > 0 && (
        <div className="mb-6">
          {/* Main image */}
          <div className="relative aspect-[4/3] bg-[var(--color-neutral-100)] rounded-2xl overflow-hidden mb-2">
            <Image
              src={images[activeImage]}
              alt={`${post.title} — ${activeImage + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-contain"
              priority={activeImage === 0}
              unoptimized={isFallback(images[activeImage])}
            />
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === activeImage
                      ? 'border-[var(--color-brand-primary)]'
                      : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`thumbnail ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized={isFallback(img)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] leading-relaxed mb-6 whitespace-pre-wrap">
        {post.content}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-[var(--color-text-tertiary)] pb-6 border-b border-[var(--color-border-subtle)]">
        <span>{t('views', { count: post.view_count })}</span>
        <span>{t('comments', { count: post.comment_count })}</span>
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => router.push(`/${locale}/community/${post.short_id}/edit`)}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {tCommon('edit')}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm text-[var(--color-error)] hover:opacity-75 transition-opacity disabled:opacity-40"
          >
            {isDeleting ? '...' : tCommon('delete')}
          </button>
        </div>
      )}
    </article>
  );
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
