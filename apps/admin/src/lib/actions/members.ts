'use server';

import { revalidatePath } from 'next/cache';
import { adminUpdateMemberStatus } from '@/lib/api/members';
import { ApiCallError } from '@/lib/api/client';
import type { UserStatus } from '@commerce/types';

function mapError(e: unknown, fallback: string): Error {
  if (e instanceof ApiCallError) {
    const map: Record<string, string> = {
      member_not_found: '회원을 찾을 수 없습니다.',
      status_update_failed: '회원 상태 변경 실패',
      unauthorized: '권한이 없습니다.',
      forbidden: '권한이 없습니다.',
    };
    return new Error(map[e.code] ?? fallback);
  }
  return e instanceof Error ? e : new Error(fallback);
}

export async function updateMemberStatus(
  memberId: string,
  newStatus: UserStatus
): Promise<void> {
  try {
    await adminUpdateMemberStatus(memberId, newStatus);
  } catch (e) {
    throw mapError(e, '회원 상태 변경 실패');
  }
  revalidatePath(`/members/${memberId}`);
  revalidatePath('/members');
}
