// Admin reviews API client. Server-side only.

import type { PaginatedResponse, Review, ReviewStatus, User } from '@commerce/types';
import { apiGetList, apiGetOne, apiPatch } from './client';
import { getAdminToken } from './auth';

export interface AdminReviewRow extends Review {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
  product: { id: string; name_ko: string; thumbnail_url: string } | null;
}

export interface AdminReviewListParams {
  status?: ReviewStatus | 'ALL';
  isBest?: boolean;
  isPhoto?: boolean;
  minRating?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

function buildQuery(params: AdminReviewListParams): string {
  const sp = new URLSearchParams();
  if (params.status && params.status !== 'ALL') sp.set('status', params.status);
  if (params.isBest !== undefined) sp.set('is_best', String(params.isBest));
  if (params.isPhoto !== undefined) sp.set('is_photo', String(params.isPhoto));
  if (params.minRating !== undefined) sp.set('min_rating', String(params.minRating));
  if (params.search) sp.set('search', params.search);
  if (params.page) sp.set('page', String(params.page));
  if (params.per_page) sp.set('per_page', String(params.per_page));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

async function authed() {
  const accessToken = await getAdminToken();
  return { accessToken, noStore: true } as const;
}

export async function adminListReviews(
  params: AdminReviewListParams = {}
): Promise<PaginatedResponse<AdminReviewRow>> {
  const { data, meta } = await apiGetList<AdminReviewRow>(
    `/admin/reviews${buildQuery(params)}`,
    await authed()
  );
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function adminGetReview(id: string): Promise<AdminReviewRow | null> {
  try {
    return await apiGetOne<AdminReviewRow>(`/admin/reviews/${id}`, await authed());
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function adminSetReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  await apiPatch(`/admin/reviews/${id}/status`, { ...(await authed()), body: { status } });
}

export async function adminSetReviewBest(id: string, isBest: boolean): Promise<void> {
  await apiPatch(`/admin/reviews/${id}/best`, { ...(await authed()), body: { is_best: isBest } });
}

export async function adminSetReviewPointRewarded(
  id: string,
  rewarded: boolean
): Promise<void> {
  await apiPatch(`/admin/reviews/${id}/point-rewarded`, {
    ...(await authed()),
    body: { rewarded },
  });
}
