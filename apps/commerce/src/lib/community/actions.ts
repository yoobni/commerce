'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { BoardType } from '@commerce/types';

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

// ─── Create post ───────────────────────────────────────────────────────────────

export interface CreatePostInput {
  board_type: BoardType;
  title: string;
  content: string;
  dog_breed: string | null;
  images: string[];
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
    })
    .select('id')
    .single();

  if (error) return { success: false, error: (error as { message: string }).message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const id = (data as any).id as string;
  revalidatePath('/[locale]/community', 'page');
  return { success: true, id };
}

// ─── Update post ───────────────────────────────────────────────────────────────

export interface UpdatePostInput {
  board_type: BoardType;
  title: string;
  content: string;
  dog_breed: string | null;
  images: string[];
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('posts') as any)
    .update({
      board_type: input.board_type,
      title: input.title.trim(),
      content: input.content.trim(),
      dog_breed: input.dog_breed || null,
      images: input.images,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId);

  if (error) return { success: false, error: (error as { message: string }).message };

  revalidatePath('/[locale]/community', 'page');
  revalidatePath(`/[locale]/community/${postId}`, 'page');
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

  if (error) return { success: false, error: (error as { message: string }).message };

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

  if (error) return { success: false, error: (error as { message: string }).message };

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

  revalidatePath(`/[locale]/community/${postId}`, 'page');
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

  if (error) return { success: false, error: (error as { message: string }).message };

  revalidatePath(`/[locale]/community/${postId}`, 'page');
  return { success: true };
}

// ─── Toggle post like ──────────────────────────────────────────────────────────

export interface LikeResult {
  success: boolean;
  liked: boolean;
  likeCount: number;
  error?: string;
}

export async function togglePostLikeAction(postId: string): Promise<LikeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, liked: false, likeCount: 0, error: 'not_authenticated' };

  // Check existing like
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('post_likes') as any)
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  // Get current count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: postData } = await (supabase.from('posts') as any)
    .select('like_count')
    .eq('id', postId)
    .single();

  const currentCount = (postData as { like_count: number } | null)?.like_count ?? 0;

  if (existing) {
    // Unlike
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('post_likes') as any)
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    if (error)
      return {
        success: false,
        liked: true,
        likeCount: currentCount,
        error: (error as { message: string }).message,
      };

    const newCount = Math.max(0, currentCount - 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (supabase.from('posts') as any).update({ like_count: newCount }).eq('id', postId);
    return { success: true, liked: false, likeCount: newCount };
  } else {
    // Like
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('post_likes') as any).insert({
      post_id: postId,
      user_id: user.id,
    });
    if (error)
      return {
        success: false,
        liked: false,
        likeCount: currentCount,
        error: (error as { message: string }).message,
      };

    const newCount = currentCount + 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (supabase.from('posts') as any).update({ like_count: newCount }).eq('id', postId);
    return { success: true, liked: true, likeCount: newCount };
  }
}

// ─── Toggle comment like ───────────────────────────────────────────────────────

export async function toggleCommentLikeAction(commentId: string): Promise<LikeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, liked: false, likeCount: 0, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('comment_likes') as any)
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: commentData } = await (supabase.from('comments') as any)
    .select('like_count')
    .eq('id', commentId)
    .single();

  const currentCount = (commentData as { like_count: number } | null)?.like_count ?? 0;

  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('comment_likes') as any)
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id);
    if (error)
      return {
        success: false,
        liked: true,
        likeCount: currentCount,
        error: (error as { message: string }).message,
      };

    const newCount = Math.max(0, currentCount - 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (supabase.from('comments') as any).update({ like_count: newCount }).eq('id', commentId);
    return { success: true, liked: false, likeCount: newCount };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('comment_likes') as any).insert({
      comment_id: commentId,
      user_id: user.id,
    });
    if (error)
      return {
        success: false,
        liked: false,
        likeCount: currentCount,
        error: (error as { message: string }).message,
      };

    const newCount = currentCount + 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (supabase.from('comments') as any).update({ like_count: newCount }).eq('id', commentId);
    return { success: true, liked: true, likeCount: newCount };
  }
}
