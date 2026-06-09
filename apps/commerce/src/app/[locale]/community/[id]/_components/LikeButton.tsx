'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { togglePostLike } from '@/lib/api/community/client';
import { ApiCallError } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';

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
      try {
        const result = await togglePostLike(postId);
        setLiked(result.liked);
        setCount(result.like_count);
      } catch (e) {
        setLiked(prevLiked);
        setCount(prevCount);
        const code = e instanceof ApiCallError ? e.code : 'likeFailed';
        setToast(t(code === 'rate_limited' ? 'error.rateLimited' : 'error.likeFailed'));
        setTimeout(() => setToast(null), 2500);
      }
    });
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={liked ? 'accent' : 'ghost'}
        size="sm"
        onClick={handleClick}
        loading={isPending}
        aria-label={liked ? 'Unlike' : 'Like'}
        leadingIcon={<HeartIcon filled={liked} />}
      >
        {t('likes', { count })}
      </Button>

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-[var(--mz-ink)] text-[var(--mz-bg)] text-xs px-3 py-1.5 rounded-[var(--radius-md)] shadow-[0_4px_18px_rgba(0,0,0,0.08)]"
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
