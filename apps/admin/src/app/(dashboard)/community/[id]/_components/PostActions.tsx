'use client';

import { useTransition } from 'react';
import { setPostStatus, setPostPinned, setUserStatus } from '@/lib/actions/community';
import type { PostStatus, UserStatus } from '@commerce/types';

interface Props {
  postId: string;
  currentStatus: PostStatus;
  isPinned: boolean;
  authorId: string;
  authorStatus: UserStatus;
}

export function PostActions({ postId, currentStatus, isPinned, authorId, authorStatus }: Props) {
  const [pending, startTransition] = useTransition();

  function handlePostStatus(status: PostStatus) {
    startTransition(() => {
      setPostStatus(postId, status).catch(console.error);
    });
  }

  function handlePin() {
    startTransition(() => {
      setPostPinned(postId, !isPinned).catch(console.error);
    });
  }

  function handleUserStatus(status: UserStatus) {
    startTransition(() => {
      setUserStatus(authorId, status, postId).catch(console.error);
    });
  }

  return (
    <div className="space-y-2">
      {/* Post visibility */}
      {currentStatus === 'ACTIVE' && (
        <button
          onClick={() => handlePostStatus('HIDDEN')}
          disabled={pending}
          className="w-full py-2 text-sm font-medium border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-60 transition-colors"
        >
          게시글 숨김
        </button>
      )}
      {currentStatus === 'HIDDEN' && (
        <button
          onClick={() => handlePostStatus('ACTIVE')}
          disabled={pending}
          className="w-full py-2 text-sm font-medium border border-green-200 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-60 transition-colors"
        >
          게시글 복구
        </button>
      )}
      {currentStatus !== 'DELETED' && (
        <button
          onClick={() => handlePostStatus('DELETED')}
          disabled={pending}
          className="w-full py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors"
        >
          게시글 삭제
        </button>
      )}

      {/* Pin */}
      <button
        onClick={handlePin}
        disabled={pending}
        className={`w-full py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-60 ${
          isPinned
            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50'
        }`}
      >
        {isPinned ? '상단 고정 해제' : '상단 고정'}
      </button>

      {/* User sanction */}
      <div className="border-t border-[var(--color-border)] pt-3 mt-3 space-y-2">
        <p className="text-xs text-[var(--color-text-tertiary)] font-medium uppercase">
          작성자 제재
        </p>
        {authorStatus === 'ACTIVE' ? (
          <button
            onClick={() => handleUserStatus('SUSPENDED')}
            disabled={pending}
            className="w-full py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors"
          >
            회원 정지
          </button>
        ) : authorStatus === 'SUSPENDED' ? (
          <button
            onClick={() => handleUserStatus('ACTIVE')}
            disabled={pending}
            className="w-full py-2 text-sm font-medium border border-green-200 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-60 transition-colors"
          >
            회원 정지 해제
          </button>
        ) : (
          <p className="text-xs text-[var(--color-text-tertiary)]">탈퇴 회원</p>
        )}
      </div>
    </div>
  );
}
