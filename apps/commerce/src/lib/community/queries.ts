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
  /** Restrict to posts authored by this user. Used by "내 글" filter. */
  authorId?: string;
  /** Restrict to posts the user has liked. Used by "좋아요한 글" filter. */
  likedByUserId?: string;
  /** Include user's own posts that are HIDDEN by moderation (so the author
   *  can still see them in their own listing). Otherwise default = ACTIVE only. */
  includeHidden?: boolean;
  /** User ids to exclude from the result (F10 user blocks). */
  excludeAuthorIds?: string[];
}

/**
 * Returns user_ids that `viewerId` has blocked. Empty array when unauthenticated
 * or no blocks set. RLS ensures users can only read their own block list.
 */
export async function getBlockedUserIds(viewerId: string | null): Promise<string[]> {
  if (!viewerId) return [];
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('user_blocks') as any)
    .select('blocked_id')
    .eq('blocker_id', viewerId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((r) => r.blocked_id as string);
}

// ─── List posts ────────────────────────────────────────────────────────────────

export async function listPosts(
  params: PostListParams = {}
): Promise<PaginatedResponse<PostWithUser>> {
  const {
    boardType = 'ALL',
    search,
    sort = 'newest',
    page = 1,
    per_page = 12,
    authorId,
    likedByUserId,
    includeHidden = false,
    excludeAuthorIds,
  } = params;
  const supabase = await createClient();
  const offset = (page - 1) * per_page;

  // "좋아요한 글" filter: two-step because the polymorphic likes table has no
  // FK relationship to posts that PostgREST can join through. Fetch the
  // user's liked post_ids first; if none, short-circuit with an empty page.
  let likedPostIds: string[] | null = null;
  if (likedByUserId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('likes') as any)
      .select('target_id')
      .eq('user_id', likedByUserId)
      .eq('target_type', 'POST');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    likedPostIds = ((data ?? []) as any[]).map((r) => r.target_id as string);
    if (likedPostIds.length === 0) {
      return { data: [], total: 0, page, per_page, has_next: false };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('posts') as any)
    .select('*, user:users!user_id(id, name, profile_image_url)', { count: 'exact' });

  if (includeHidden) {
    // Owner-only view: show ACTIVE + HIDDEN, exclude DELETED.
    query = query.neq('status', 'DELETED');
  } else {
    query = query.eq('status', 'ACTIVE');
  }
  if (authorId) query = query.eq('user_id', authorId);
  if (likedPostIds) query = query.in('id', likedPostIds);
  if (excludeAuthorIds && excludeAuthorIds.length > 0) {
    // PostgREST `not.in.(...)` syntax via .not().in()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).not('user_id', 'in', `(${excludeAuthorIds.join(',')})`);
  }
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

// ─── List comments for a post (paginated by top-level) ──────────────────────

export interface ListCommentsResult {
  data: CommentWithUser[];
  /** Total top-level comment count (replies not counted here). */
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

const COMMENT_PAGE_SIZE = 20;

/**
 * Paginated by *top-level* comments — replies are always included with their
 * parent. Pagination at the parent level avoids splitting threads across pages.
 */
export async function listComments(
  postId: string,
  page: number = 1,
  perPage: number = COMMENT_PAGE_SIZE,
  excludeAuthorIds?: string[],
): Promise<ListCommentsResult> {
  const supabase = await createClient();
  const offset = (page - 1) * perPage;

  // Step 1: paginate top-level comments + total count.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let topQuery = (supabase.from('comments') as any)
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

  // Step 2: fetch replies for *this* page's top-level comments.
  const topIds = topLevel.map((c) => c.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let replyQuery = (supabase.from('comments') as any)
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
