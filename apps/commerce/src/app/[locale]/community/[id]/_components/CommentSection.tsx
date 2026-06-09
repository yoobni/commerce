'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  createComment,
  deleteComment,
  loadMoreComments,
  toggleCommentLike,
  updateComment,
} from '@/lib/api/community/client';
import { ApiCallError } from '@/lib/api/client';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';
import type { CommentWithUser } from '@/lib/api/community/comments';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

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
    try {
      const result = await toggleCommentLike(comment.id);
      onLikeToggle(comment.id, result.liked, result.like_count);
    } catch {
      // Silent — heart icon stays unchanged.
    } finally {
      setIsLiking(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(t('deleteCommentConfirm'))) return;
    try {
      await deleteComment(comment.id);
      onDelete(comment.id);
    } catch {
      // Silent for now; the server already rejected so the row stays.
    }
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
    try {
      await updateComment(comment.id, editText);
      onEdit(comment.id, editText.trim(), new Date().toISOString());
      setIsEditing(false);
    } catch (e) {
      const code = e instanceof ApiCallError ? e.code : 'updateFailed';
      const retry =
        e instanceof ApiCallError && code === 'rate_limited'
          ? (e.details as { retryAfterSec?: number } | undefined)?.retryAfterSec ?? 60
          : 60;
      setEditError(
        code === 'rate_limited'
          ? t('error.rateLimited', { sec: retry })
          : t('error.updateFailed')
      );
    } finally {
      setIsSavingEdit(false);
    }
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
            className="w-8 h-8 rounded-full shrink-0 object-cover"
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
              {formatRelativeTime(comment.created_at, locale, tCommon('justNow'))}
            </span>
            {comment.last_edited_at && (
              <span
                title={`${tCommon('edited')}: ${formatRelativeTime(comment.last_edited_at, locale, tCommon('justNow'))}`}
                className="text-xs text-[var(--color-text-tertiary)]"
              >
                · {tCommon('edited')}
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={500}
                rows={3}
                error={editError ?? undefined}
                showCounter
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="quiet" size="sm" onClick={cancelEdit}>
                  {tCommon('cancel')}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  loading={isSavingEdit}
                  disabled={!editText.trim()}
                  onClick={saveEdit}
                >
                  {tCommon('save')}
                </Button>
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
      try {
        const next = page + 1;
        const result = await loadMoreComments(postId, next);
        // De-dupe in case a comment was added optimistically while paging.
        const seen = new Set(comments.map((c) => c.id));
        const fresh = result.data.filter((c) => !seen.has(c.id));
        setComments((prev) => [...prev, ...fresh]);
        setPage(result.page);
        setHasNext(result.has_next);
      } catch {
        // Swallow — load-more is non-critical, user can retry.
      }
    });
  }

  async function submitComment(content: string, parentId: string | null) {
    if (!content.trim() || isSubmitting) return;
    if (!isAuthenticated) {
      showToast(t('loginToComment'));
      return;
    }

    setIsSubmitting(true);
    let created: { id: string } | null = null;
    try {
      created = await createComment(postId, content, parentId);
    } catch (e) {
      const code = e instanceof ApiCallError ? e.code : 'commentFailed';
      const retry =
        e instanceof ApiCallError && code === 'rate_limited'
          ? (e.details as { retryAfterSec?: number } | undefined)?.retryAfterSec ?? 60
          : 60;
      showToast(
        code === 'rate_limited'
          ? t('error.rateLimited', { sec: retry })
          : t('error.commentFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
    if (!created) return;

    // Optimistic: add a temp comment (real data refreshes on next load)
    const tempComment: CommentWithUser = {
      id: created.id,
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

      {/* Comment input — single magazine frame wrapping textarea + footer */}
      {isAuthenticated ? (
        <div className="mb-8 rounded-[var(--radius-md)] border border-[var(--mz-line)] bg-[var(--mz-bg)] focus-within:border-[var(--mz-ink)] transition-colors">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('commentPlaceholder')}
            rows={3}
            maxLength={1000}
            className="w-full px-4 pt-3 pb-2 bg-transparent text-[14px] leading-relaxed text-[var(--mz-ink)] placeholder:text-[var(--mz-ink-mute)] resize-none border-0 outline-none focus:outline-none focus-visible:outline-none"
          />
          <div className="flex items-center justify-between gap-2 px-4 py-2 border-t border-[var(--mz-line)]">
            <span className="text-[11px] text-[var(--mz-ink-mute)] tabular-nums">
              {commentText.length} / 1000
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              disabled={!commentText.trim()}
              onClick={() => submitComment(commentText, null)}
            >
              {t('commentSubmit')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--mz-surface)] rounded-[var(--radius-md)] border border-[var(--mz-line)] p-4 mb-8 text-center">
          <p className="text-sm text-[var(--mz-ink-mute)]">{t('loginToComment')}</p>
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
                <div className="ml-8 pl-4 border-l-2 border-[var(--color-border-subtle)] mb-3 space-y-2">
                  <p className="text-xs text-[var(--mz-ink-mute)]">@{replyTo.authorName}</p>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t('replyPlaceholder')}
                    rows={2}
                    maxLength={500}
                    showCounter
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="quiet"
                      size="sm"
                      onClick={() => setReplyTo(null)}
                    >
                      {t('cancelReply')}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      loading={isSubmitting}
                      disabled={!replyText.trim()}
                      onClick={() => submitComment(replyText, comment.id)}
                    >
                      {t('commentSubmit')}
                    </Button>
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            loading={isLoadingMore}
            onClick={handleLoadMore}
          >
            {isLoadingMore
              ? t('loadingMore')
              : t('loadMoreComments', { remaining: initialTotal - comments.length })}
          </Button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[var(--mz-ink)] text-[var(--mz-bg)] text-sm px-4 py-2 rounded-[var(--radius-md)] shadow-[0_4px_18px_rgba(0,0,0,0.08)] z-50"
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

function formatRelativeTime(isoString: string, locale: string, justNow: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  // `Intl.RelativeTimeFormat('ko').format(0, 'minute')` returns "현재 분" which
  // reads as a noun phrase rather than "just now", so we provide our own copy.
  if (minutes < 1) return justNow;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  if (days < 7) return rtf.format(-days, 'day');
  return new Date(isoString).toLocaleDateString(locale);
}
