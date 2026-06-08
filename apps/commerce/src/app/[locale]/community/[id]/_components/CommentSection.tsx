'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  createCommentAction,
  deleteCommentAction,
  loadMoreCommentsAction,
  toggleCommentLikeAction,
  updateCommentAction,
} from '@/lib/community/actions';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';
import type { CommentWithUser } from '@/lib/community/queries';

interface CommentSectionProps {
  postId: string;
  initialComments: CommentWithUser[];
  initialTotal: number;
  initialPage: number;
  initialHasNext: boolean;
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
  onEdit: (id: string, content: string, lastEditedAt: string) => void;
  locale: string;
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
  onEdit,
  locale,
  depth = 0,
}: CommentRowProps) {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const [isLiking, setIsLiking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
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

  function startEdit() {
    setEditText(comment.content);
    setEditError(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditError(null);
  }

  async function saveEdit() {
    if (!editText.trim() || isSavingEdit) return;
    setIsSavingEdit(true);
    setEditError(null);
    const result = await updateCommentAction(comment.id, postId, editText);
    setIsSavingEdit(false);
    if (!result.success) {
      setEditError(
        result.error === 'rate_limited'
          ? t('error.rateLimited', { sec: result.retryAfterSec ?? 60 })
          : t('error.updateFailed'),
      );
      return;
    }
    onEdit(comment.id, editText.trim(), new Date().toISOString());
    setIsEditing(false);
  }

  return (
    <div className={depth > 0 ? 'ml-8 pl-4 border-l-2 border-[var(--color-border-subtle)]' : ''}>
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        {comment.user?.profile_image_url ? (
          <Image
            src={safeImageSrc(comment.user.profile_image_url)}
            alt={comment.user.name}
            width={32}
            height={32}
            className="rounded-full shrink-0 object-cover"
            unoptimized={isFallback(safeImageSrc(comment.user.profile_image_url))}
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
              {formatRelativeTime(comment.created_at, locale)}
            </span>
            {comment.last_edited_at && (
              <span
                title={`${tCommon('edited')}: ${formatRelativeTime(comment.last_edited_at, locale)}`}
                className="text-xs text-[var(--color-text-tertiary)]"
              >
                · {tCommon('edited')}
              </span>
            )}
          </div>

          {isEditing ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full text-sm text-[var(--color-text-primary)] bg-[var(--color-neutral-50)] border border-[var(--color-border)] rounded-md p-2 resize-none focus:outline-none focus:border-[var(--color-brand-primary)]"
              />
              {editError && (
                <p className="text-xs text-[var(--color-error)] mt-1">{editError}</p>
              )}
              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={!editText.trim() || isSavingEdit}
                  className="px-3 py-1 text-xs rounded-md bg-[var(--color-brand-primary)] text-white disabled:opacity-40"
                >
                  {tCommon('save')}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed break-words whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handleLike}
                disabled={!isAuthenticated || isLiking}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  liked ? 'text-rose-500' : 'text-[var(--color-text-tertiary)] hover:text-rose-400'
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
                <>
                  <button
                    onClick={startEdit}
                    className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    {tCommon('edit')}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors"
                  >
                    {tCommon('delete')}
                  </button>
                </>
              )}
            </div>
          )}
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
              onEdit={onEdit}
              locale={locale}
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
  initialTotal,
  initialPage,
  initialHasNext,
  initialLikedCommentIds,
  isAuthenticated,
  currentUserId,
  locale,
}: CommentSectionProps) {
  const t = useTranslations('community');
  const [comments, setComments] = useState<CommentWithUser[]>(initialComments);
  const [page, setPage] = useState(initialPage);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(initialLikedCommentIds));
  const [replyTo, setReplyTo] = useState<{ parentId: string; authorName: string } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoadingMore, startLoadMore] = useTransition();

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
      if (liked) { next.add(id); } else { next.delete(id); }
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

  function handleEdit(id: string, content: string, lastEditedAt: string) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, content, last_edited_at: lastEditedAt }
          : {
              ...c,
              replies: c.replies?.map((r) =>
                r.id === id ? { ...r, content, last_edited_at: lastEditedAt } : r,
              ),
            },
      ),
    );
  }

  function handleLoadMore() {
    startLoadMore(async () => {
      const next = page + 1;
      const result = await loadMoreCommentsAction(postId, next);
      // De-dupe in case a comment was added optimistically while paging.
      const seen = new Set(comments.map((c) => c.id));
      const fresh = result.data.filter((c) => !seen.has(c.id));
      setComments((prev) => [...prev, ...fresh]);
      setPage(result.page);
      setHasNext(result.has_next);
    });
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
      showToast(
        result.error === 'rate_limited'
          ? t('error.rateLimited', { sec: result.retryAfterSec ?? 60 })
          : t('error.commentFailed'),
      );
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
      last_edited_at: null,
      user: null,
      replies: [],
    };

    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId ? { ...c, replies: [...(c.replies ?? []), tempComment] } : c
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
        {t('comments', {
          count: comments.length + comments.reduce((s, c) => s + (c.replies?.length ?? 0), 0),
        })}
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
          <p className="text-sm text-[var(--color-text-secondary)]">{t('loginToComment')}</p>
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
                onEdit={handleEdit}
                locale={locale}
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

      {/* Load more */}
      {hasNext && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-50)] transition-colors disabled:opacity-40"
          >
            {isLoadingMore ? t('loadingMore') : t('loadMoreComments', { remaining: initialTotal - comments.length })}
          </button>
        </div>
      )}

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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function formatRelativeTime(isoString: string, locale: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (minutes < 1) return rtf.format(0, 'minute');
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  if (days < 7) return rtf.format(-days, 'day');
  return new Date(isoString).toLocaleDateString(locale);
}
