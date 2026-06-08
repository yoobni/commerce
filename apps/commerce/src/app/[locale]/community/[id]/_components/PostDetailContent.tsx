'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { deletePostAction } from '@/lib/community/actions';
import type { PostWithUser } from '@/lib/community/queries';
import type { BoardType } from '@commerce/types';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';
import { MarkdownContent } from '@/components/community/MarkdownContent';
import { BlockUserButton } from './BlockUserButton';

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
  isAuthenticated: boolean;
  locale: string;
}

export function PostDetailContent({
  post,
  isOwner,
  isAuthenticated,
  locale,
}: PostDetailContentProps) {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close kebab menu on click outside or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function handleDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  const images = (post.images ?? []).map((img) => ({
    url: safeImageSrc(img.url),
    alt: img.alt,
  }));

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
      {/* Board badge + pinned + owner kebab */}
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
        {isOwner && (
          <div className="relative ml-auto" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={tCommon('more')}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-tertiary)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <KebabIcon />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-9 z-10 min-w-[120px] rounded-lg border border-[var(--color-border)] bg-white shadow-lg py-1"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(`/${locale}/community/${post.short_id}/edit`);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)]"
                >
                  {tCommon('edit')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/5 disabled:opacity-40"
                >
                  {isDeleting ? '...' : tCommon('delete')}
                </button>
              </div>
            )}
          </div>
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
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {post.user?.name ?? ''}
              </p>
              {post.user && (
                <BlockUserButton
                  targetUserId={post.user.id}
                  targetUserName={post.user.name}
                  isAuthenticated={isAuthenticated}
                  locale={locale}
                  isSelf={isOwner}
                />
              )}
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1.5">
              <span>{formatDate(post.created_at)}</span>
              {post.last_edited_at && (
                <>
                  <span aria-hidden="true">·</span>
                  <span
                    title={`${tCommon('edited')}: ${formatDate(post.last_edited_at)}`}
                    className="text-[var(--color-text-secondary)]"
                  >
                    {tCommon('edited')}
                  </span>
                </>
              )}
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
              src={images[activeImage].url}
              alt={images[activeImage].alt || `${post.title} — ${activeImage + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-contain"
              priority={activeImage === 0}
              unoptimized={isFallback(images[activeImage].url)}
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
                    src={img.url}
                    alt={img.alt || `thumbnail ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized={isFallback(img.url)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content — markdown rendered, sanitized for UGC safety */}
      <div className="mb-6">
        <MarkdownContent content={post.content} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-[var(--color-text-tertiary)] pb-6 border-b border-[var(--color-border-subtle)]">
        <span>{t('views', { count: post.view_count })}</span>
        <span>{t('comments', { count: post.comment_count })}</span>
      </div>

    </article>
  );
}

function KebabIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
