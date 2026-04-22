'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { getSession } from '@/lib/auth/session';
import type { ReviewStatus } from '@commerce/types';

// ─── Set review status (ACTIVE ↔ HIDDEN / DELETED) ───────────────────────────

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reviews') as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;

  revalidatePath(`/reviews/${id}`);
  revalidatePath('/reviews');
}

// ─── Toggle best review flag ──────────────────────────────────────────────────

export async function toggleReviewBest(id: string, isBest: boolean): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reviews') as any)
    .update({ is_best: isBest, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;

  revalidatePath(`/reviews/${id}`);
  revalidatePath('/reviews');
}

// ─── Toggle point rewarded flag ───────────────────────────────────────────────

export async function setReviewPointRewarded(id: string, rewarded: boolean): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reviews') as any)
    .update({ point_rewarded: rewarded, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;

  revalidatePath(`/reviews/${id}`);
}
