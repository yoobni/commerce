'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { createCommentAction, deleteCommentAction, toggleCommentLikeAction } from '@/lib/community/actions';
import type { CommentWithUser } from '@/lib/community/queries';

interface CommentSectionProps {
  postId: string;
  initialComments: CommentWithUser[];
  initialLikedCommentIds: string[];
  isAuthenticated: boolean;
  currentUserId: string | null;
  locale: string;
}

interface CommentRowProps {
  comment: CommentWithUser;
  postId: string;
  isAuthenticated: boolean;
  currentUserId: string | null;
  likedIds: Set<string>;
  onDelete: (id: string) => void;
  onLikeToggle: (id: string, liked: boolean, count: number) => void;
  onReply: (parentId: string, parentAuthor: string) => void;
  depth?: number;
}

function CommentRow({
  comment,
  postId,
  isAuthenticated,
  currentUserId,
  likedIds,
  onDelete,
  onLikeToggle,
  onReply,
  depth = 0,
}: CommentRowProps) {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const [isLiking, setIsLiking] = useState(false);
  const isOwner = currentUserId === comment.user_id;
  const liked = likedIds.has(comment.id);

  async function handleLike() {
    if (!isAuthenticated || isLiking) return;
    setIsLiking(true);
    const result = await toggleCommentLikeAction(comment.id);
    setIsLiking(false);
    if (result.success) {
      onLikeToggle(comment.id, result.liked, result.likeCount);
    }
  }

  async function handleDelete() {
    if (!window.confirm(t('deleteCommentConfirm'))) return;
    await deleteCommentAction(comment.id, postId);
    onDelete(comment.id);
  }

  return (
    <div className={depth > 0 ? 'ml-8 pl-4 border-l-2 border-[var(--color-border-subtle)]' : ''}>
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        {comment.user?.profile_image_url ? (
          <Image
            src={comment.user.profile_image_url}
            alt={comment.user.name}
            width={32}
            height={32}
            className="rounded-full shrink-0 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--color-neutral-200)] shrink-0 flex items-center justify-center text-xs text-[var(--color-text-secondary)] font-medium">
            {comment.user?.name?.charAt(0) ?? '?'}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {comment.user?.name ?? ''}
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>

          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isLiking}
              className={`flex items-center gap-1 text-xs transition-colors ${
                liked
                  ? 'text-rose-500'
                  : 'text-[var(--color-text-tertiary)] hover:text-rose-400'
              } disabled:opacity-40`}
            >
              <SmallHeartIcon filled={liked} />
              {comment.like_count > 0 && comment.like_count}
            </button>

            {depth === 0 && isAuthenticated && (
              <button
                onClick={() => onReply(comment.id, comment.user?.name ?? '')}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
              >
                {t('reply')}
              </button>
            )}

            {isOwner && (
              <button
                onClick={handleDelete}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors"
              >
                {tCommon('delete')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              postId={postId}
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
              likedIds={likedIds}
              onDelete={onDelete}
              onLikeToggle={onLikeToggle}
              onReply={onReply}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  postId,
  initialComments,
  initialLikedCommentIds,
  isAuthenticated,
  currentUserId,
  locale,
}: CommentSectionProps) {
  const t = useTranslations('community');
  const [comments, setComments] = useState<CommentWithUser[]>(initialComments);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(initialLikedCommentIds));
  const [replyTo, setReplyTo] = useState<{ parentId: string; authorName: string } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleDelete(deletedId: string) {
    setComments((prev) =>
      prev
        .filter((c) => c.id !== deletedId)
        .map((c) => ({
          ...c,
          replies: c.replies?.filter((r) => r.id !== deletedId) ?? [],
        }))
    );
  }

  function handleLikeToggle(id: string, liked: boolean, count: number) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      liked ? next.add(id) : next.delete(id);
      return next;
    });
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) return { ...c, like_count: count };
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) => (r.id === id ? { ...r, like_count: count } : r)),
          };
        }
        return c;
      })
    );
  }

  function handleReply(parentId: string, authorName: string) {
    setReplyTo({ parentId, authorName });
    setReplyText('');
  }

  async function submitComment(content: string, parentId: string | null) {
    if (!content.trim() || isSubmitting) return;
    if (!isAuthenticated) {
      showToast(t('loginToComment'));
      return;
    }

    setIsSubmitting(true);
    const result = await createCommentAction(postId, content, parentId);
    setIsSubmitting(false);

    if (!result.success) {
      showToast(t('error.commentFailed'));
      return;
    }

    // Optimistic: add a temp comment (real data refreshes on next load)
    const tempComment: CommentWithUser = {
      id: result.id ?? `temp-${Date.now()}`,
      post_id: postId,
      user_id: currentUserId ?? '',
      parent_id: parentId,
      content: content.trim(),
      like_count: 0,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: null,
      replies: [],
    };

    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies ?? []), tempComment] }
            : c
        )
      );
      setReplyTo(null);
      setReplyText('');
    } else {
      setComments((prev) => [...prev, tempComment]);
      setCommentText('');
    }
  }

  return (
    <section className="mt-8" aria-label="댓글">
      {/* Header */}
      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
        {t('comments', { count: comments.length + comments.reduce((s, c) => s + (c.replies?.length ?? 0), 0) })}
      </h2>

      {/* Comment input */}
      {isAuthenticated ? (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-3 mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('commentPlaceholder')}
            rows={3}
            maxLength={1000}
            className="w-full text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] resize-none focus:outline-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={() => submitComment(commentText, null)}
              disabled={!commentText.trim() || isSubmitting}
              className="px-4 py-1.5 bg-[var(--color-cta)] text-white text-sm rounded-lg disabled:opacity-40 transition-opacity hover:opacity-90"
            >
              {isSubmitting ? '...' : t('commentSubmit')}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--color-neutral-50)] rounded-xl border border-[var(--color-border)] p-4 mb-6 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('loginToComment')}
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {comments.length === 0 ? (
          <p className="text-sm text-[var(--color-text-tertiary)] py-6 text-center">
            {t('noComments')}
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              <CommentRow
                comment={comment}
                postId={postId}
                isAuthenticated={isAuthenticated}
                currentUserId={currentUserId}
                likedIds={likedIds}
                onDelete={handleDelete}
                onLikeToggle={handleLikeToggle}
                onReply={handleReply}
              />

              {/* Reply input inline */}
              {replyTo?.parentId === comment.id && (
                <div className="ml-8 pl-4 border-l-2 border-[var(--color-border-subtle)] mb-3">
                  <div className="bg-[var(--color-neutral-50)] rounded-lg border border-[var(--color-border)] p-3">
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-2">
                      @{replyTo.authorName}
                    </p>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t('replyPlaceholder')}
                      rows={2}
                      maxLength={500}
                      className="w-full text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] resize-none bg-transparent focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      >
                        {t('cancelReply')}
                      </button>
                      <button
                        type="button"
                        onClick={() => submitComment(replyText, comment.id)}
                        disabled={!replyText.trim() || isSubmitting}
                        className="px-3 py-1 bg-[var(--color-cta)] text-white text-xs rounded disabled:opacity-40 hover:opacity-90"
                      >
                        {t('commentSubmit')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[var(--color-brand-primary)] text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50"
        >
          {toast}
        </div>
      )}
    </section>
  );
}

function SmallHeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(isoString).toLocaleDateString('ko-KR');
}
