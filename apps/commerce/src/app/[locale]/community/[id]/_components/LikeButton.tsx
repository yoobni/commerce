'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { togglePostLikeAction } from '@/lib/community/actions';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
  locale: string;
}

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  isAuthenticated,
  locale: _locale,
}: LikeButtonProps) {
  const t = useTranslations('community');
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  function handleClick() {
    if (!isAuthenticated) {
      setToast(t('loginToLike'));
      setTimeout(() => setToast(null), 2500);
      return;
    }
    if (isPending) return;

    // Optimistic
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    startTransition(async () => {
      const result = await togglePostLikeAction(postId);
      if (!result.success) {
        setLiked(prevLiked);
        setCount(prevCount);
        setToast(t('error.likeFailed'));
        setTimeout(() => setToast(null), 2500);
      } else {
        setLiked(result.liked);
        setCount(result.likeCount);
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={liked ? 'Unlike' : 'Like'}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${
          liked
            ? 'bg-rose-50 border-rose-300 text-rose-600'
            : 'bg-white border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-50)]'
        } ${isPending ? 'opacity-60' : ''}`}
      >
        <HeartIcon filled={liked} />
        <span>{t('likes', { count })}</span>
      </button>

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-[var(--color-brand-primary)] text-white text-xs px-3 py-1.5 rounded-lg shadow-md"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
