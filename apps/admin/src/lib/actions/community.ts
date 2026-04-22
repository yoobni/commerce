'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { getSession } from '@/lib/auth/session';
import type { PostStatus, UserStatus } from '@commerce/types';

// ─── Post status ──────────────────────────────────────────────────────────────

export async function setPostStatus(postId: string, status: PostStatus): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('posts') as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', postId);
  if (error) throw error;

  revalidatePath(`/community/${postId}`);
  revalidatePath('/community');
}

// ─── Post pin ─────────────────────────────────────────────────────────────────

export async function setPostPinned(postId: string, isPinned: boolean): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('posts') as any)
    .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
    .eq('id', postId);
  if (error) throw error;

  revalidatePath(`/community/${postId}`);
  revalidatePath('/community');
}

// ─── Comment status ───────────────────────────────────────────────────────────

export async function setCommentStatus(
  commentId: string,
  postId: string,
  status: PostStatus
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('comments') as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', commentId);
  if (error) throw error;

  revalidatePath(`/community/${postId}`);
}

// ─── User sanction (suspend / unsuspend) ─────────────────────────────────────

export async function setUserStatus(
  userId: string,
  status: UserStatus,
  refererPostId?: string
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;

  if (refererPostId) {
    revalidatePath(`/community/${refererPostId}`);
  }
  revalidatePath('/community');
  revalidatePath('/members');
}
