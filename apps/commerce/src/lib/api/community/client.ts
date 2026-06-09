'use client';

// Client-side helpers for @commerce/server. Mirrors the server-side
// lib/api/community/*.ts modules but reads the access token from the
// browser Supabase session instead of `next/headers` cookies.
//
// Client Components import from here; Server Components use the *.ts
// counterparts (posts.ts, comments.ts, likes.ts, user-blocks.ts).

import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import { apiDelete, apiGetList, apiGetOne, apiPatch, apiPost } from '../client';
import type { CommentWithUser, ListCommentsResult } from './comments';
import type {
  CreatePostInput,
  UpdatePostInput,
} from './posts';

async function browserToken(): Promise<string | undefined> {
  const supabase = createBrowserSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

// ── Posts ──────────────────────────────────────────────────────────────────

export async function createPost(
  input: CreatePostInput
): Promise<{ id: string; short_id: string; slug: string }> {
  return apiPost('/community/posts', {
    body: input,
    accessToken: await browserToken(),
  });
}

export async function updatePost(postId: string, input: UpdatePostInput): Promise<void> {
  await apiPatch<{ id: string }>(`/community/posts/${postId}`, {
    body: input,
    accessToken: await browserToken(),
  });
}

export async function deletePost(postId: string): Promise<void> {
  await apiDelete(`/community/posts/${postId}`, { accessToken: await browserToken() });
}

// ── Comments ───────────────────────────────────────────────────────────────

export async function loadMoreComments(
  postId: string,
  page: number,
  perPage?: number
): Promise<ListCommentsResult> {
  const sp = new URLSearchParams();
  sp.set('page', String(page));
  if (perPage) sp.set('per_page', String(perPage));
  const { data, meta } = await apiGetList<CommentWithUser>(
    `/community/posts/${postId}/comments?${sp.toString()}`,
    { accessToken: await browserToken(), noStore: true }
  );
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function createComment(
  postId: string,
  content: string,
  parentId: string | null = null
): Promise<{ id: string }> {
  return apiPost(`/community/posts/${postId}/comments`, {
    body: { content, parent_id: parentId },
    accessToken: await browserToken(),
  });
}

export async function updateComment(commentId: string, content: string): Promise<void> {
  await apiPatch<{ id: string }>(`/community/comments/${commentId}`, {
    body: { content },
    accessToken: await browserToken(),
  });
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiDelete(`/community/comments/${commentId}`, { accessToken: await browserToken() });
}

// ── Likes ──────────────────────────────────────────────────────────────────

export interface ToggleLikeResult {
  liked: boolean;
  like_count: number;
}

export async function togglePostLike(postId: string): Promise<ToggleLikeResult> {
  return apiPost(`/community/posts/${postId}/likes`, { accessToken: await browserToken() });
}

export async function toggleCommentLike(commentId: string): Promise<ToggleLikeResult> {
  return apiPost(`/community/comments/${commentId}/likes`, {
    accessToken: await browserToken(),
  });
}

// ── User blocks ────────────────────────────────────────────────────────────

export async function blockUser(targetUserId: string): Promise<void> {
  await apiPost<{ target_user_id: string }>('/community/user-blocks', {
    body: { target_user_id: targetUserId },
    accessToken: await browserToken(),
  });
}

export async function unblockUser(targetUserId: string): Promise<void> {
  await apiDelete(`/community/user-blocks/${targetUserId}`, {
    accessToken: await browserToken(),
  });
}

// ── Product search (typeahead) ─────────────────────────────────────────────
// Phase 2.c.4에서 F#8 ProductSelector가 SWR로 호출할 때 사용.

import type { Product } from '@commerce/types';

export async function searchProductsForPost(
  q: string,
  excludeIds: string[] = []
): Promise<Product[]> {
  const sp = new URLSearchParams();
  sp.set('q', q);
  if (excludeIds.length > 0) sp.set('exclude', excludeIds.join(','));
  // Catalog data — no token needed.
  const { data } = await apiGetList<Product>(
    `/products?${sp.toString()}`,
    { noStore: true }
  );
  return data;
}
