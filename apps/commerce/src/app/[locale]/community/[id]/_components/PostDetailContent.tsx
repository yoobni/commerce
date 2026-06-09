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
      {/* Eyebrow row — uppercase accent label (magazine "rubric") + pinned + kebab */}
      <div className="flex items-center gap-4 mb-5">
        <span className="text-eyebrow text-[var(--mz-accent)]">
          {t(BOARD_LABEL_KEYS[post.board_type])}
        </span>
        {post.is_pinned && (
          <span
            className="text-eyebrow text-[var(--mz-ink-mute)] inline-flex items-center gap-1.5"
            title={t('pinned')}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mz-accent)]" aria-hidden="true" />
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
              className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--mz-ink-mute)] hover:bg-[var(--mz-bg-deep)] hover:text-[var(--mz-ink)] transition-colors"
            >
              <KebabIcon />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-9 z-10 min-w-[120px] rounded-[var(--radius-md)] border border-[var(--mz-line)] bg-[var(--mz-surface)] shadow-[0_4px_18px_rgba(0,0,0,0.08)] py-1"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(`/${locale}/community/${post.short_id}/edit`);
                  }}
                  className="w-full text-left px-3 py-2 text-[13px] text-[var(--mz-ink)] hover:bg-[var(--mz-bg-deep)]"
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
                  className="w-full text-left px-3 py-2 text-[13px] text-[var(--color-error)] hover:bg-[var(--color-error)]/5 disabled:opacity-40"
                >
                  {isDeleting ? '...' : tCommon('delete')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title — Fraunces serif, regular weight (magazine displays are not bold) */}
      <h1 className="font-serif text-[30px] md:text-[44px] font-[400] leading-[1.1] tracking-[-0.02em] text-[var(--mz-ink)] mb-8 md:mb-10">
        {post.title}
      </h1>

      {/* Meta row — author left, dog_breed right */}
      <div className="flex items-center justify-between gap-3 pb-8 mb-10 md:mb-12 border-b border-[var(--mz-line)]">
        <div className="flex items-center gap-3 min-w-0">
          {post.user?.profile_image_url ? (
            <Image
              src={safeImageSrc(post.user.profile_image_url)}
              alt={post.user.name}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full shrink-0 object-cover"
              unoptimized={isFallback(safeImageSrc(post.user.profile_image_url))}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--mz-bg-deep)] flex items-center justify-center text-[13px] font-medium text-[var(--mz-ink-soft)] shrink-0">
              {post.user?.name?.charAt(0) ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-[600] text-[var(--mz-ink)] truncate">
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
            <p className="text-[12px] text-[var(--mz-ink-mute)] flex items-center gap-1.5 mt-0.5">
              <span>{formatDate(post.created_at)}</span>
              {post.last_edited_at && (
                <>
                  <span aria-hidden="true">·</span>
                  <span
                    title={`${tCommon('edited')}: ${formatDate(post.last_edited_at)}`}
                  >
                    {tCommon('edited')}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Dog breed — soft secondary line, no pill */}
        {post.dog_breed && (
          <span className="text-[12px] md:text-[13px] font-medium text-[var(--mz-ink-soft)] shrink-0">
            🐾 {post.dog_breed}
          </span>
        )}
      </div>

      {/* Image gallery */}
      {images.length > 0 && (
        <div className="mb-10 md:mb-12">
          {/* Main image */}
          <div className="relative aspect-[4/3] bg-[var(--mz-bg-deep)] rounded-[var(--radius-md)] overflow-hidden mb-3">
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
                  className={`relative w-16 h-16 shrink-0 rounded-[var(--radius-sm)] overflow-hidden border-2 transition-colors ${
                    idx === activeImage
                      ? 'border-[var(--mz-ink)]'
                      : 'border-transparent hover:border-[var(--mz-line-strong)]'
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
      <div className="mb-10 md:mb-12 text-[17px] md:text-[18px] leading-[1.75] text-[var(--mz-ink-soft)]">
        <MarkdownContent content={post.content} />
      </div>

      {/* Stats row — magazine article footer */}
      <div className="flex items-center gap-5 text-[12px] text-[var(--mz-ink-mute)] uppercase tracking-[0.06em] font-medium">
        <span>{t('views', { count: post.view_count })}</span>
        <span aria-hidden="true">·</span>
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
