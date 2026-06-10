'use server';

import { revalidatePath } from 'next/cache';
import {
  adminSetPostStatus,
  adminSetPostPinned,
  adminSetCommentStatus,
} from '@/lib/api/community';
import { adminUpdateMemberStatus } from '@/lib/api/members';
import { ApiCallError } from '@/lib/api/client';
import type { PostStatus, UserStatus } from '@commerce/types';

function mapError(e: unknown, fallback: string): Error {
  if (e instanceof ApiCallError) {
    const map: Record<string, string> = {
      post_not_found: '게시글을 찾을 수 없습니다.',
      post_status_update_failed: '게시글 상태 변경 실패',
      post_pin_update_failed: '고정 설정 실패',
      comment_status_update_failed: '댓글 상태 변경 실패',
      status_update_failed: '회원 상태 변경 실패',
      unauthorized: '권한이 없습니다.',
      forbidden: '권한이 없습니다.',
    };
    return new Error(map[e.code] ?? fallback);
  }
  return e instanceof Error ? e : new Error(fallback);
}

export async function setPostStatus(postId: string, status: PostStatus): Promise<void> {
  try {
    await adminSetPostStatus(postId, status);
  } catch (e) {
    throw mapError(e, '게시글 상태 변경 실패');
  }
  revalidatePath(`/community/${postId}`);
  revalidatePath('/community');
}

export async function setPostPinned(postId: string, isPinned: boolean): Promise<void> {
  try {
    await adminSetPostPinned(postId, isPinned);
  } catch (e) {
    throw mapError(e, '고정 설정 실패');
  }
  revalidatePath(`/community/${postId}`);
  revalidatePath('/community');
}

export async function setCommentStatus(
  commentId: string,
  postId: string,
  status: PostStatus
): Promise<void> {
  try {
    await adminSetCommentStatus(commentId, status);
  } catch (e) {
    throw mapError(e, '댓글 상태 변경 실패');
  }
  revalidatePath(`/community/${postId}`);
}

// User sanction from a community context. Reuses /admin/members/:id/status —
// no separate community endpoint needed.
export async function setUserStatus(
  userId: string,
  status: UserStatus,
  refererPostId?: string
): Promise<void> {
  try {
    await adminUpdateMemberStatus(userId, status);
  } catch (e) {
    throw mapError(e, '회원 상태 변경 실패');
  }
  if (refererPostId) {
    revalidatePath(`/community/${refererPostId}`);
  }
  revalidatePath('/community');
  revalidatePath('/members');
}
