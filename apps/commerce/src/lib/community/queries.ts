import type { Post, Comment, User, BoardType, PaginatedResponse } from '@commerce/types';
import { createClient } from '@/lib/supabase/server';

// ─── Extended types ────────────────────────────────────────────────────────────

export type PostWithUser = Omit<Post, 'user'> & {
  user: Pick<User, 'id' | 'name' | 'profile_image_url'> | null;
};

export type CommentWithUser = Omit<Comment, 'user'> & {
  user: Pick<User, 'id' | 'name' | 'profile_image_url'> | null;
  replies?: CommentWithUser[];
};

// ─── List params ───────────────────────────────────────────────────────────────

export interface PostListParams {
  boardType?: BoardType | 'ALL';
  search?: string;
  sort?: 'newest' | 'popular';
  page?: number;
  per_page?: number;
}

// ─── List posts ────────────────────────────────────────────────────────────────

export async function listPosts(
  params: PostListParams = {}
): Promise<PaginatedResponse<PostWithUser>> {
  const { boardType = 'ALL', search, sort = 'newest', page = 1, per_page = 12 } = params;
  const supabase = await createClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('posts') as any)
    .select('*, user:users!user_id(id, name, profile_image_url)', { count: 'exact' })
    .eq('status', 'ACTIVE');

  if (boardType !== 'ALL') query = query.eq('board_type', boardType);
  if (search) query = query.ilike('title', `%${search}%`);

  if (sort === 'popular') {
    query = query
      .order('like_count', { ascending: false })
      .order('created_at', { ascending: false });
  } else {
    query = query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as PostWithUser[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

// ─── Get single post (increments view_count) ─────────────────────────────────

export async function getPost(id: string): Promise<PostWithUser | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('posts') as any)
    .select('*, user:users!user_id(id, name, profile_image_url)')
    .eq('id', id)
    .eq('status', 'ACTIVE')
    .single();

  if (error || !data) return null;

  // Increment view count (fire-and-forget — ignore errors)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (supabase.from('posts') as any)
    .update({ view_count: (data as PostWithUser).view_count + 1 })
    .eq('id', id);

  return data as PostWithUser;
}

// ─── List comments for a post ─────────────────────────────────────────────────

export async function listComments(postId: string): Promise<CommentWithUser[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('comments') as any)
    .select('*, user:users!user_id(id, name, profile_image_url)')
    .eq('post_id', postId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: true });

  if (error) throw error;

  const allComments = (data ?? []) as CommentWithUser[];

  // Build tree: top-level + nested replies
  const topLevel: CommentWithUser[] = [];
  const byParent: Record<string, CommentWithUser[]> = {};

  for (const c of allComments) {
    if (c.parent_id) {
      if (!byParent[c.parent_id]) byParent[c.parent_id] = [];
      byParent[c.parent_id].push(c);
    } else {
      topLevel.push(c);
    }
  }

  for (const c of topLevel) {
    c.replies = byParent[c.id] ?? [];
  }

  return topLevel;
}

// ─── Check if user liked a post ───────────────────────────────────────────────

export async function checkUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('post_likes') as any)
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  return !!data;
}

// ─── Get user's liked comment ids for a post ─────────────────────────────────

export async function getUserLikedCommentIds(postId: string, userId: string): Promise<string[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('comment_likes') as any)
    .select('comment_id')
    .eq('user_id', userId);

  if (!data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => r.comment_id as string);
}
