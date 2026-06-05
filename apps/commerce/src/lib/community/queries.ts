import type { Post, PostImage, Comment, User, BoardType, PaginatedResponse } from '@commerce/types';
import { createClient } from '@/lib/supabase/server';
import { safeImageSrc } from '@/lib/images/safeSrc';

/**
 * Backwards compatibility: pre-F8 rows stored `images` as `string[]`. Coerce
 * those into the new {url, alt} object form so callers can rely on a single
 * shape. New posts persist objects directly.
 */
function normalizeImage(raw: unknown): PostImage | null {
  if (typeof raw === 'string') return { url: raw, alt: '' };
  if (raw && typeof raw === 'object') {
    const obj = raw as { url?: unknown; alt?: unknown };
    if (typeof obj.url === 'string') {
      return { url: obj.url, alt: typeof obj.alt === 'string' ? obj.alt : '' };
    }
  }
  return null;
}

function sanitizePost<T extends { images?: unknown; user?: { profile_image_url?: string | null } | null }>(p: T): T {
  let images = p.images as PostImage[] | null | undefined;
  if (Array.isArray(p.images)) {
    const seen = new Set<string>();
    images = (p.images as unknown[])
      .map(normalizeImage)
      .filter((img): img is PostImage => {
        if (!img) return false;
        const url = safeImageSrc(img.url);
        if (seen.has(url)) return false;
        seen.add(url);
        img.url = url;
        return true;
      });
  }
  return {
    ...p,
    images,
    user: p.user ? { ...p.user, profile_image_url: safeImageSrc(p.user.profile_image_url) } : p.user,
  };
}

function sanitizeComment<T extends { user?: { profile_image_url?: string | null } | null }>(c: T): T {
  return {
    ...c,
    user: c.user ? { ...c.user, profile_image_url: safeImageSrc(c.user.profile_image_url) } : c.user,
  };
}

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
  if (search) {
    // Escape ilike wildcards so user input can't match unintended rows.
    const safeSearch = search.replace(/[%_\\]/g, (m) => `\\${m}`).slice(0, 100);
    if (safeSearch) query = query.ilike('title', `%${safeSearch}%`);
  }

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
    data: ((data ?? []) as PostWithUser[]).map(sanitizePost),
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

// ─── Get single post (increments view_count) ─────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Look up a post by either UUID (legacy URLs) or short_id (canonical URLs).
 * Format-detects to avoid two round-trips. Returns null on miss.
 */
export async function getPost(idOrShortId: string): Promise<PostWithUser | null> {
  const supabase = await createClient();
  const lookupColumn = UUID_REGEX.test(idOrShortId) ? 'id' : 'short_id';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('posts') as any)
    .select('*, user:users!user_id(id, name, profile_image_url)')
    .eq(lookupColumn, idOrShortId)
    .eq('status', 'ACTIVE')
    .single();

  if (error || !data) return null;

  // Increment view count (fire-and-forget — ignore errors)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (supabase.from('posts') as any)
    .update({ view_count: (data as PostWithUser).view_count + 1 })
    .eq('id', (data as PostWithUser).id);

  return sanitizePost(data as PostWithUser);
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

  const allComments = ((data ?? []) as CommentWithUser[]).map(sanitizeComment);

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
//
// Likes are stored polymorphically in the `likes` table keyed by
// (user_id, target_type, target_id). target_type is the like_target_type enum
// ('POST' | 'COMMENT').

export async function checkUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('likes') as any)
    .select('id')
    .eq('user_id', userId)
    .eq('target_type', 'POST')
    .eq('target_id', postId)
    .maybeSingle();

  return !!data;
}

// ─── Get user's liked comment ids for a post ─────────────────────────────────

export async function getUserLikedCommentIds(postId: string, userId: string): Promise<string[]> {
  const supabase = await createClient();

  // Comments belonging to this post — used to scope the likes query.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: commentRows } = await (supabase.from('comments') as any)
    .select('id')
    .eq('post_id', postId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commentIds = ((commentRows ?? []) as any[]).map((r) => r.id as string);
  if (commentIds.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('likes') as any)
    .select('target_id')
    .eq('user_id', userId)
    .eq('target_type', 'COMMENT')
    .in('target_id', commentIds);

  if (!data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => r.target_id as string);
}
