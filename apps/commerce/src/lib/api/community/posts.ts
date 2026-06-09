import type {
  BoardType,
  Comment,
  PaginatedResponse,
  Post,
  PostImage,
  User,
} from '@commerce/types';
import { apiGetList, apiGetOne, apiPost, apiPatch, apiDelete } from '../client';
import { getAccessToken } from '../auth';

// ── Types (mirrors apps/server/src/community/posts/posts.service.ts) ──────

export type PostWithUser = Omit<Post, 'user'> & {
  user: Pick<User, 'id' | 'name' | 'profile_image_url'> | null;
};

export type CommentWithUser = Omit<Comment, 'user'> & {
  user: Pick<User, 'id' | 'name' | 'profile_image_url'> | null;
  replies?: CommentWithUser[];
};

export interface PostListParams {
  boardType?: BoardType | 'ALL';
  q?: string;
  sort?: 'newest' | 'popular';
  page?: number;
  per_page?: number;
  mentionsProductId?: string;
  /** Authenticated viewer's own posts (requires session). */
  mine?: boolean;
  /** Posts the authenticated viewer has liked (requires session). */
  liked?: boolean;
}

export interface CreatePostInput {
  board_type: BoardType;
  title: string;
  content: string;
  dog_breed?: string | null;
  images?: PostImage[];
  product_ids?: string[];
}

export type UpdatePostInput = CreatePostInput;

const COMMUNITY_REVALIDATE = 30;

function buildListQuery(params: PostListParams): string {
  const sp = new URLSearchParams();
  if (params.boardType && params.boardType !== 'ALL') sp.set('board_type', params.boardType);
  if (params.q) sp.set('q', params.q);
  if (params.sort) sp.set('sort', params.sort);
  if (params.page) sp.set('page', String(params.page));
  if (params.per_page) sp.set('per_page', String(params.per_page));
  if (params.mentionsProductId) sp.set('mentions_product_id', params.mentionsProductId);
  if (params.mine) sp.set('mine', 'true');
  if (params.liked) sp.set('liked', 'true');
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export async function listPosts(
  params: PostListParams = {}
): Promise<PaginatedResponse<PostWithUser>> {
  // mine/liked depend on the authenticated viewer; forward the token so the
  // server can resolve req.user and apply the right filters.
  const needsAuth = params.mine || params.liked;
  const accessToken = needsAuth ? (await getAccessToken()) ?? undefined : undefined;

  const { data, meta } = await apiGetList<PostWithUser>(
    `/community/posts${buildListQuery(params)}`,
    {
      revalidate: COMMUNITY_REVALIDATE,
      accessToken,
    }
  );
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function getPost(idOrShortId: string): Promise<PostWithUser | null> {
  try {
    return await apiGetOne<PostWithUser>(
      `/community/posts/${encodeURIComponent(idOrShortId)}`,
      { revalidate: COMMUNITY_REVALIDATE }
    );
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 404) return null;
    throw e;
  }
}

export async function createPost(
  input: CreatePostInput
): Promise<{ id: string; short_id: string; slug: string }> {
  const accessToken = (await getAccessToken()) ?? undefined;
  return apiPost('/community/posts', { body: input, accessToken });
}

export async function updatePost(postId: string, input: UpdatePostInput): Promise<void> {
  const accessToken = (await getAccessToken()) ?? undefined;
  await apiPatch<{ id: string }>(`/community/posts/${postId}`, {
    body: input,
    accessToken,
  });
}

export async function deletePost(postId: string): Promise<void> {
  const accessToken = (await getAccessToken()) ?? undefined;
  await apiDelete(`/community/posts/${postId}`, { accessToken });
}
