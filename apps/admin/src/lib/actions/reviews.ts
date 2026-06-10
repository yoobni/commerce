'use server';

import { revalidatePath } from 'next/cache';
import {
  adminSetReviewStatus,
  adminSetReviewBest,
  adminSetReviewPointRewarded,
} from '@/lib/api/reviews';
import { ApiCallError } from '@/lib/api/client';
import type { ReviewStatus } from '@commerce/types';

function mapError(e: unknown, fallback: string): Error {
  if (e instanceof ApiCallError) {
    const map: Record<string, string> = {
      review_not_found: '리뷰를 찾을 수 없습니다.',
      review_status_update_failed: '리뷰 상태 변경 실패',
      review_best_update_failed: 'Best 설정 실패',
      review_point_update_failed: '포인트 지급 상태 변경 실패',
      unauthorized: '권한이 없습니다.',
      forbidden: '권한이 없습니다.',
    };
    return new Error(map[e.code] ?? fallback);
  }
  return e instanceof Error ? e : new Error(fallback);
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  try {
    await adminSetReviewStatus(id, status);
  } catch (e) {
    throw mapError(e, '리뷰 상태 변경 실패');
  }
  revalidatePath(`/reviews/${id}`);
  revalidatePath('/reviews');
}

export async function toggleReviewBest(id: string, isBest: boolean): Promise<void> {
  try {
    await adminSetReviewBest(id, isBest);
  } catch (e) {
    throw mapError(e, 'Best 설정 실패');
  }
  revalidatePath(`/reviews/${id}`);
  revalidatePath('/reviews');
}

export async function setReviewPointRewarded(
  id: string,
  rewarded: boolean
): Promise<void> {
  try {
    await adminSetReviewPointRewarded(id, rewarded);
  } catch (e) {
    throw mapError(e, '포인트 지급 상태 변경 실패');
  }
  revalidatePath(`/reviews/${id}`);
}
