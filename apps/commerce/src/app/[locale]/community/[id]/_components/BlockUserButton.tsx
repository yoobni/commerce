'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { blockUserAction } from '@/lib/community/actions';

interface BlockUserButtonProps {
  /** Author of the content the viewer is looking at. */
  targetUserId: string;
  /** Display name shown in the confirm dialog. */
  targetUserName: string | null | undefined;
  /** When unauthenticated → click routes to login. */
  isAuthenticated: boolean;
  /** Used to build the post-login redirect target. */
  locale: string;
  /** Disable rendering on own content. */
  isSelf: boolean;
}

/**
 * Small inline "차단" button shown next to a user's name on community
 * content. Confirms via window.confirm and then blocks the user. After
 * success, calls router.refresh() so the current page re-fetches and
 * filters out the blocked user's content.
 */
export function BlockUserButton({
  targetUserId,
  targetUserName,
  isAuthenticated,
  locale,
  isSelf,
}: BlockUserButtonProps) {
  const t = useTranslations('community');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isSelf) return null;

  function handleClick() {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    const name = targetUserName ?? t('blockUnknownUser');
    if (!window.confirm(t('blockConfirm', { name }))) return;
    startTransition(async () => {
      const result = await blockUserAction(targetUserId);
      if (!result.success) {
        setError(t('blockFailed'));
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors disabled:opacity-40"
      >
        {pending ? '...' : t('blockUser')}
      </button>
      {error && <span className="text-[11px] text-[var(--color-error)] ml-2">{error}</span>}
    </>
  );
}
