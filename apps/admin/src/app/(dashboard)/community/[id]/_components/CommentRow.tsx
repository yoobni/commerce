'use client';

import { useTransition } from 'react';
import { setCommentStatus } from '@/lib/actions/community';
import type { PostStatus } from '@commerce/types';
import type { AdminCommentRow } from '@/lib/queries/community';

interface Props {
  comment: AdminCommentRow;
  postId: string;
}

const STATUS_BADGE: Record<PostStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  HIDDEN: 'bg-orange-100 text-orange-700',
  DELETED: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<PostStatus, string> = {
  ACTIVE: '노출',
  HIDDEN: '숨김',
  DELETED: '삭제',
};

export function CommentRow({ comment, postId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleStatus(status: PostStatus) {
    startTransition(() => {
      setCommentStatus(comment.id, postId, status).catch(console.error);
    });
  }

  return (
    <div
      className={`px-4 py-3 flex gap-3 ${
        comment.parent_id ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''
      } ${comment.status !== 'ACTIVE' ? 'opacity-60' : ''}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500 mt-0.5">
        {comment.user?.name?.[0] ?? '?'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {comment.user?.name ?? '-'}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[comment.status as PostStatus]}`}
          >
            {STATUS_LABEL[comment.status as PostStatus]}
          </span>
          {comment.parent_id && (
            <span className="text-xs text-[var(--color-text-tertiary)]">답글</span>
          )}
          <span className="text-xs text-[var(--color-text-tertiary)] ml-auto">
            {new Date(comment.created_at).toLocaleString('ko-KR')}
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex flex-col gap-1">
        {comment.status === 'ACTIVE' ? (
          <button
            onClick={() => handleStatus('HIDDEN')}
            disabled={pending}
            className="px-2 py-1 text-xs border border-orange-200 text-orange-600 rounded hover:bg-orange-50 disabled:opacity-60"
          >
            숨김
          </button>
        ) : comment.status === 'HIDDEN' ? (
          <button
            onClick={() => handleStatus('ACTIVE')}
            disabled={pending}
            className="px-2 py-1 text-xs border border-green-200 text-green-600 rounded hover:bg-green-50 disabled:opacity-60"
          >
            복구
          </button>
        ) : null}
        {comment.status !== 'DELETED' && (
          <button
            onClick={() => handleStatus('DELETED')}
            disabled={pending}
            className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 disabled:opacity-60"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
