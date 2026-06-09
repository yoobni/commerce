import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Comment, User } from '@commerce/types';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';
import { safeImageSrc } from '../../common/safe-image-src';

export type CommentWithUser = Omit<Comment, 'user'> & {
  user: Pick<User, 'id' | 'name' | 'profile_image_url'> | null;
  replies?: CommentWithUser[];
};

export interface ListCommentsResult {
  data: CommentWithUser[];
  /** Total top-level comment count (replies are not counted here). */
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

const COMMENT_PAGE_SIZE = 20;
const CONTENT_MAX = 1000;

function sanitizeComment<T extends { user?: { profile_image_url?: string | null } | null }>(
  c: T
): T {
  return {
    ...c,
    user: c.user
      ? { ...c.user, profile_image_url: safeImageSrc(c.user.profile_image_url) }
      : c.user,
  };
}

// Service-role for the user join (users RLS is own-row-only). NestJS controls
// every read via status='ACTIVE' / parent_id filters.

@Injectable()
export class CommentsService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  /**
   * Paginated by *top-level* comments — replies are always included with their
   * parent so threads never split across pages.
   */
  async list(
    postId: string,
    page = 1,
    perPage = COMMENT_PAGE_SIZE,
    excludeAuthorIds?: string[]
  ): Promise<ListCommentsResult> {
    const offset = (page - 1) * perPage;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let topQuery = (this.supabase.from('comments') as any)
      .select('*, user:users!user_id(id, name, profile_image_url)', { count: 'exact' })
      .eq('post_id', postId)
      .eq('status', 'ACTIVE')
      .is('parent_id', null);
    if (excludeAuthorIds && excludeAuthorIds.length > 0) {
      topQuery = topQuery.not('user_id', 'in', `(${excludeAuthorIds.join(',')})`);
    }
    const { data: topRows, count, error } = await topQuery
      .order('created_at', { ascending: true })
      .range(offset, offset + perPage - 1);
    if (error) throw error;

    const topLevel = ((topRows ?? []) as CommentWithUser[]).map(sanitizeComment);
    const total = count ?? 0;

    if (topLevel.length === 0) {
      return { data: [], total, page, per_page: perPage, has_next: false };
    }

    const topIds = topLevel.map((c) => c.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let replyQuery = (this.supabase.from('comments') as any)
      .select('*, user:users!user_id(id, name, profile_image_url)')
      .in('parent_id', topIds)
      .eq('status', 'ACTIVE');
    if (excludeAuthorIds && excludeAuthorIds.length > 0) {
      replyQuery = replyQuery.not('user_id', 'in', `(${excludeAuthorIds.join(',')})`);
    }
    const { data: replyRows } = await replyQuery.order('created_at', { ascending: true });

    const replies = ((replyRows ?? []) as CommentWithUser[]).map(sanitizeComment);
    const byParent: Record<string, CommentWithUser[]> = {};
    for (const r of replies) {
      if (!r.parent_id) continue;
      if (!byParent[r.parent_id]) byParent[r.parent_id] = [];
      byParent[r.parent_id].push(r);
    }
    for (const c of topLevel) {
      c.replies = byParent[c.id] ?? [];
    }

    return {
      data: topLevel,
      total,
      page,
      per_page: perPage,
      has_next: offset + perPage < total,
    };
  }

  /** Returns owner user_id, or null if comment doesn't exist. */
  async getOwnerId(commentId: string): Promise<string | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('comments') as any)
      .select('user_id')
      .eq('id', commentId)
      .single();
    if (!data) return null;
    return (data as { user_id: string }).user_id;
  }

  async create(
    postId: string,
    authorId: string,
    content: string,
    parentId: string | null
  ): Promise<{ id: string }> {
    const trimmed = content.trim().slice(0, CONTENT_MAX);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('comments') as any)
      .insert({
        post_id: postId,
        user_id: authorId,
        parent_id: parentId,
        content: trimmed,
        like_count: 0,
        status: 'ACTIVE',
      })
      .select('id')
      .single();
    if (error || !data) throw error ?? new Error('community_db_error');

    // Bump post.comment_count fire-and-forget (no FK trigger for this counter
    // in seed, so we maintain it from the app like the previous server action).
    void this.bumpPostCommentCount(postId, +1);

    return { id: (data as { id: string }).id };
  }

  async update(commentId: string, content: string): Promise<void> {
    const trimmed = content.trim().slice(0, CONTENT_MAX);
    if (!trimmed) throw new Error('empty_content');
    const nowIso = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('comments') as any)
      .update({ content: trimmed, updated_at: nowIso, last_edited_at: nowIso })
      .eq('id', commentId);
    if (error) throw error;
  }

  async softDelete(commentId: string): Promise<{ post_id: string } | null> {
    // Fetch post_id so the caller (controller) can decrement comment_count.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row } = await (this.supabase.from('comments') as any)
      .select('post_id')
      .eq('id', commentId)
      .single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('comments') as any)
      .update({ status: 'DELETED', updated_at: new Date().toISOString() })
      .eq('id', commentId);
    if (error) throw error;
    if (row) {
      void this.bumpPostCommentCount((row as { post_id: string }).post_id, -1);
      return row as { post_id: string };
    }
    return null;
  }

  private async bumpPostCommentCount(postId: string, delta: number): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('posts') as any)
      .select('comment_count')
      .eq('id', postId)
      .single();
    if (!data) return;
    const next = Math.max(0, (data as { comment_count: number }).comment_count + delta);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.supabase.from('posts') as any)
      .update({ comment_count: next })
      .eq('id', postId);
  }
}
