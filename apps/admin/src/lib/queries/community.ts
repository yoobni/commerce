/**
 * Admin community queries — uses service-role client (bypasses RLS).
 */

import type {
  Post,
  Comment,
  BoardType,
  PostStatus,
  User,
  PaginatedResponse,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── UI labels & Badge variants (어드민 페이지 공용) ────────────────────────

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  ACTIVE: '노출',
  HIDDEN: '숨김',
  DELETED: '삭제',
};

export const POST_STATUS_VARIANT: Record<
  PostStatus,
  'success' | 'warning' | 'destructive'
> = {
  ACTIVE: 'success',
  HIDDEN: 'warning',
  DELETED: 'destructive',
};

export const BOARD_TYPE_LABEL: Record<BoardType, string> = {
  DAILY: '일상',
  STYLE: '스타일',
  TIP: '팁',
  QUESTION: '질문',
};

// ─── Extended types ───────────────────────────────────────────────────────────

export interface AdminPostRow extends Post {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
}

export interface AdminPostDetail extends Post {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
  comments: AdminCommentRow[];
}

export interface AdminCommentRow extends Comment {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
}

// ─── Post list ────────────────────────────────────────────────────────────────

export interface AdminPostListParams {
  status?: PostStatus | 'ALL';
  boardType?: BoardType | 'ALL';
  isPinned?: boolean;
  search?: string; // title
  page?: number;
  per_page?: number;
}

export async function adminListPosts(
  params: AdminPostListParams = {}
): Promise<PaginatedResponse<AdminPostRow>> {
  const { status = 'ALL', boardType = 'ALL', isPinned, search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('posts') as any).select(
    '*, user:users!user_id(id, name, profile_image_url)',
    { count: 'exact' }
  );

  if (status !== 'ALL') query = query.eq('status', status);
  if (boardType !== 'ALL') query = query.eq('board_type', boardType);
  if (isPinned !== undefined) query = query.eq('is_pinned', isPinned);
  if (search) query = query.ilike('title', `%${search}%`);

  query = query.order('created_at', { ascending: false }).range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as AdminPostRow[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

// ─── Post detail with comments ────────────────────────────────────────────────

export async function adminGetPost(id: string): Promise<AdminPostDetail | null> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post, error: postError } = await (supabase.from('posts') as any)
    .select('*, user:users!user_id(id, name, profile_image_url)')
    .eq('id', id)
    .single();
  if (postError || !post) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: comments, error: commentError } = await (supabase.from('comments') as any)
    .select('*, user:users!user_id(id, name, profile_image_url)')
    .eq('post_id', id)
    .order('created_at', { ascending: true });
  if (commentError) throw commentError;

  return {
    ...(post as Post & { user: Pick<User, 'id' | 'name' | 'profile_image_url'> | null }),
    comments: (comments ?? []) as AdminCommentRow[],
  };
}
