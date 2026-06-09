import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BoardType, PaginatedResponse, Post, PostImage, User } from '@commerce/types';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';
import { safeImageSrc } from '../../common/safe-image-src';
import { generateSlug } from '../slug';

export interface CreatePostInput {
  board_type: BoardType;
  title: string;
  content: string;
  dog_breed?: string | null;
  images?: PostImage[];
  product_ids?: string[];
}

export type UpdatePostInput = CreatePostInput;

const MAX_PRODUCTS_PER_POST = 5;
const dedupeProductIds = (ids: string[] | undefined): string[] =>
  Array.from(new Set(ids ?? [])).slice(0, MAX_PRODUCTS_PER_POST);

// NOTE: posts read needs to join `users` for the author profile (name,
// profile_image_url). The users table has own-row-only SELECT RLS, so anon
// would always get user: null. NestJS is the BFF — we authorize at the
// controller layer (status='ACTIVE' filter, owner-only for hidden, etc.)
// and use the service-role client to bypass RLS for the join.

// ── Types ──────────────────────────────────────────────────────────────────
export type PostWithUser = Omit<Post, 'user'> & {
  user: Pick<User, 'id' | 'name' | 'profile_image_url'> | null;
};

export interface PostListParams {
  boardType?: BoardType | 'ALL';
  q?: string;
  sort?: 'newest' | 'popular';
  page?: number;
  per_page?: number;
  /** Restrict to posts that mention this product (posts.product_ids contains). */
  mentionsProductId?: string;
  /** Restrict to posts authored by this user. */
  authorId?: string;
  /** Restrict to posts the user has liked. */
  likedByUserId?: string;
  /** Include HIDDEN posts (owner-view only). */
  includeHidden?: boolean;
  /** User ids to exclude from results (block list). */
  excludeAuthorIds?: string[];
}

// ── Sanitizers ─────────────────────────────────────────────────────────────

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
    user: p.user
      ? { ...p.user, profile_image_url: safeImageSrc(p.user.profile_image_url) }
      : p.user,
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class PostsService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  /** Resolve the list of user ids that `viewerId` has blocked. */
  async getBlockedUserIds(viewerId: string | null): Promise<string[]> {
    if (!viewerId) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('user_blocks') as any)
      .select('blocked_id')
      .eq('blocker_id', viewerId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map((r) => r.blocked_id as string);
  }

  /** Has the given user liked this post? */
  async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('likes') as any)
      .select('id', { head: false })
      .eq('user_id', userId)
      .eq('target_type', 'POST')
      .eq('target_id', postId)
      .limit(1);
    return !!(data && data.length > 0);
  }

  async list(params: PostListParams = {}): Promise<PaginatedResponse<PostWithUser>> {
    const {
      boardType = 'ALL',
      q,
      sort = 'newest',
      page = 1,
      per_page = 12,
      mentionsProductId,
      authorId,
      likedByUserId,
      includeHidden = false,
      excludeAuthorIds,
    } = params;

    const offset = (page - 1) * per_page;

    // "liked posts" needs a two-step lookup since likes is polymorphic and has
    // no FK PostgREST can join through. Empty likes → empty page (short-circuit).
    let likedPostIds: string[] | null = null;
    if (likedByUserId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (this.supabase.from('likes') as any)
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
    let query = (this.supabase.from('posts') as any).select(
      '*, user:users!user_id(id, name, profile_image_url)',
      { count: 'exact' }
    );

    if (includeHidden) {
      query = query.neq('status', 'DELETED');
    } else {
      query = query.eq('status', 'ACTIVE');
    }
    if (authorId) query = query.eq('user_id', authorId);
    if (likedPostIds) query = query.in('id', likedPostIds);
    if (excludeAuthorIds && excludeAuthorIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).not(
        'user_id',
        'in',
        `(${excludeAuthorIds.join(',')})`
      );
    }
    if (boardType !== 'ALL') query = query.eq('board_type', boardType);
    if (mentionsProductId) {
      // posts.product_ids is jsonb (not uuid[]). PostgREST array-contains via
      // supabase-js would emit `cs.{uuid}` which jsonb rejects — pass the value
      // as a JSON string so the operator matches the column type.
      query = query.contains('product_ids', JSON.stringify([mentionsProductId]));
    }
    if (q && q.trim()) {
      const safe = q
        .replace(/[,()]/g, ' ')
        .replace(/[%_\\]/g, (m) => `\\${m}`)
        .trim()
        .slice(0, 100);
      if (safe) {
        query = query.or(`title.ilike.*${safe}*,content.ilike.*${safe}*`);
      }
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

  /** Authorization helper — returns owner user_id or null if post doesn't exist. */
  async getOwnerId(postId: string): Promise<string | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('posts') as any)
      .select('user_id')
      .eq('id', postId)
      .single();
    if (!data) return null;
    return (data as { user_id: string }).user_id;
  }

  async create(
    authorId: string,
    input: CreatePostInput
  ): Promise<{ id: string; short_id: string; slug: string }> {
    const title = input.title.trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('posts') as any)
      .insert({
        user_id: authorId,
        board_type: input.board_type,
        title,
        content: input.content.trim(),
        dog_breed: input.dog_breed ?? null,
        images: input.images ?? [],
        product_ids: dedupeProductIds(input.product_ids),
        like_count: 0,
        comment_count: 0,
        view_count: 0,
        is_pinned: false,
        status: 'ACTIVE',
        slug: generateSlug(title),
        // short_id is filled by DB default (gen_random_uuid first 8 hex chars).
      })
      .select('id, short_id, slug')
      .single();

    if (error || !data) throw error ?? new Error('community_db_error');
    return data as { id: string; short_id: string; slug: string };
  }

  async update(postId: string, input: UpdatePostInput): Promise<void> {
    const nowIso = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('posts') as any)
      .update({
        board_type: input.board_type,
        title: input.title.trim(),
        content: input.content.trim(),
        dog_breed: input.dog_breed ?? null,
        images: input.images ?? [],
        product_ids: dedupeProductIds(input.product_ids),
        updated_at: nowIso,
        last_edited_at: nowIso,
      })
      .eq('id', postId);
    if (error) throw error;
  }

  async softDelete(postId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('posts') as any)
      .update({ status: 'DELETED', updated_at: new Date().toISOString() })
      .eq('id', postId);
    if (error) throw error;
  }

  /**
   * Look up a post by UUID (legacy URL) or short_id (canonical URL).
   * Returns null on miss. Format-detects to avoid two round-trips.
   */
  async getOne(idOrShortId: string): Promise<PostWithUser | null> {
    const lookupColumn = UUID_REGEX.test(idOrShortId) ? 'id' : 'short_id';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('posts') as any)
      .select('*, user:users!user_id(id, name, profile_image_url)')
      .eq(lookupColumn, idOrShortId)
      .eq('status', 'ACTIVE')
      .single();

    if (error || !data) return null;
    return sanitizePost(data as PostWithUser);
  }
}
