'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { getSession } from '@/lib/auth/session';
import type { UserStatus } from '@commerce/types';

// ─── Update member status ─────────────────────────────────────────────────────

export async function updateMemberStatus(memberId: string, newStatus: UserStatus): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', memberId);
  if (error) throw error;

  revalidatePath(`/members/${memberId}`);
  revalidatePath('/members');
}
