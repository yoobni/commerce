'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { BoardType, PostImage } from '@commerce/types';
import { generateSlug } from './slug';
import { listComments, type ListCommentsResult } from './queries';

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
  /** Canonical URL components for client-side redirect after create. */
  short_id?: string;
  slug?: string;
}

// ─── Create post ───────────────────────────────────────────────────────────────

export interface CreatePostInput {
  board_type: BoardType;
  title: string;
  content: string;
  dog_breed: string | null;
  images: PostImage[];
}

export async function createPostAction(input: CreatePostInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('posts') as any)
    .insert({
      user_id: user.id,
      board_type: input.board_type,
      title: input.title.trim(),
      content: input.content.trim(),
      dog_breed: input.dog_breed || null,
      images: input.images,
      product_ids: [],
      like_count: 0,
      comment_count: 0,
      view_count: 0,
      is_pinned: false,
      status: 'ACTIVE',
      slug: generateSlug(input.title.trim()),
      // short_id is filled by DB default (gen_random_uuid first 8 hex chars)
    })
    .select('id, short_id, slug')
    .single();

  if (error) return { success: false, error: 'COMMUNITY_DB_ERROR' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as { id: string; short_id: string; slug: string };
  revalidatePath('/[locale]/community', 'page');
  return { success: true, id: row.id, short_id: row.short_id, slug: row.slug };
}

// ─── Update post ───────────────────────────────────────────────────────────────

export interface UpdatePostInput {
  board_type: BoardType;
  title: string;
  content: string;
  dog_breed: string | null;
  images: PostImage[];
}

export async function updatePostAction(
  postId: string,
  input: UpdatePostInput
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // Verify ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('posts') as any)
    .select('user_id')
    .eq('id', postId)
    .single();

  if (!existing || (existing as { user_id: string }).user_id !== user.id) {
    return { success: false, error: 'forbidden' };
  }

  const nowIso = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('posts') as any)
    .update({
      board_type: input.board_type,
      title: input.title.trim(),
      content: input.content.trim(),
      dog_breed: input.dog_breed || null,
      images: input.images,
      updated_at: nowIso,
      last_edited_at: nowIso,
    })
    .eq('id', postId);

  if (error) return { success: false, error: 'COMMUNITY_DB_ERROR' };

  revalidatePath('/[locale]/community', 'page');
  revalidatePath('/[locale]/community/[id]/[[...slug]]', 'page');
  return { success: true };
}

// ─── Delete post ───────────────────────────────────────────────────────────────

export async function deletePostAction(postId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // Verify ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('posts') as any)
    .select('user_id')
    .eq('id', postId)
    .single();

  if (!existing || (existing as { user_id: string }).user_id !== user.id) {
    return { success: false, error: 'forbidden' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('posts') as any)
    .update({ status: 'DELETED', updated_at: new Date().toISOString() })
    .eq('id', postId);

  if (error) return { success: false, error: 'COMMUNITY_DB_ERROR' };

  revalidatePath('/[locale]/community', 'page');
  return { success: true };
}

// ─── Create comment ────────────────────────────────────────────────────────────

export async function createCommentAction(
  postId: string,
  content: string,
  parentId: string | null = null
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('comments') as any)
    .insert({
      post_id: postId,
      user_id: user.id,
      parent_id: parentId,
      content: content.trim(),
      like_count: 0,
      status: 'ACTIVE',
    })
    .select('id')
    .single();

  if (error) return { success: false, error: 'COMMUNITY_DB_ERROR' };

  // Increment post comment_count (fire-and-forget)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (supabase.from('posts') as any)
    .select('comment_count')
    .eq('id', postId)
    .single()
    .then(({ data: post }: { data: { comment_count: number } | null }) => {
      if (post) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        void (supabase.from('posts') as any)
          .update({ comment_count: post.comment_count + 1 })
          .eq('id', postId);
      }
    });

  revalidatePath('/[locale]/community/[id]/[[...slug]]', 'page');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { success: true, id: (data as any).id as string };
}

// ─── Delete comment ────────────────────────────────────────────────────────────

export async function deleteCommentAction(
  commentId: string,
  postId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // Verify ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('comments') as any)
    .select('user_id')
    .eq('id', commentId)
    .single();

  if (!existing || (existing as { user_id: string }).user_id !== user.id) {
    return { success: false, error: 'forbidden' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('comments') as any)
    .update({ status: 'DELETED', updated_at: new Date().toISOString() })
    .eq('id', commentId);

  if (error) return { success: false, error: 'COMMUNITY_DB_ERROR' };

  revalidatePath('/[locale]/community/[id]/[[...slug]]', 'page');
  return { success: true };
}

// ─── Toggle post like ──────────────────────────────────────────────────────────

export interface LikeResult {
  success: boolean;
  liked: boolean;
  likeCount: number;
  error?: string;
}

async function toggleLikeViaRpc(
  targetType: 'POST' | 'COMMENT',
  targetId: string,
): Promise<LikeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, liked: false, likeCount: 0, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('toggle_like', {
    p_target_type: targetType,
    p_target_id: targetId,
    p_user_id: user.id,
  });

  if (error || !data || !data[0]) {
    return { success: false, liked: false, likeCount: 0, error: 'COMMUNITY_DB_ERROR' };
  }

  const row = data[0] as { out_liked: boolean; out_like_count: number };
  return { success: true, liked: row.out_liked, likeCount: row.out_like_count };
}

export async function togglePostLikeAction(postId: string): Promise<LikeResult> {
  return toggleLikeViaRpc('POST', postId);
}

// ─── Toggle comment like ───────────────────────────────────────────────────────

export async function toggleCommentLikeAction(commentId: string): Promise<LikeResult> {
  return toggleLikeViaRpc('COMMENT', commentId);
}

// ─── Load more comments (pagination) ──────────────────────────────────────────

/**
 * Server action used by CommentSection to fetch the next page of comments.
 * No auth required — comments are public.
 */
export async function loadMoreCommentsAction(
  postId: string,
  page: number,
): Promise<ListCommentsResult> {
  return listComments(postId, page);
}

// ─── Block / unblock user ─────────────────────────────────────────────────────

export async function blockUserAction(targetUserId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };
  if (user.id === targetUserId) return { success: false, error: 'cannot_block_self' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('user_blocks') as any)
    .insert({ blocker_id: user.id, blocked_id: targetUserId });

  // 23505 = unique_violation → already blocked → treat as success.
  if (error && (error as { code?: string }).code !== '23505') {
    return { success: false, error: 'COMMUNITY_DB_ERROR' };
  }

  revalidatePath('/[locale]/community', 'page');
  revalidatePath('/[locale]/community/[id]/[[...slug]]', 'page');
  return { success: true };
}

export async function unblockUserAction(targetUserId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('user_blocks') as any)
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetUserId);

  if (error) return { success: false, error: 'COMMUNITY_DB_ERROR' };

  revalidatePath('/[locale]/community', 'page');
  revalidatePath('/[locale]/community/[id]/[[...slug]]', 'page');
  return { success: true };
}
