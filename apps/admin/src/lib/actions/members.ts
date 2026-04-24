'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { getSession } from '@/lib/auth/session';

// ─── Suspend member ───────────────────────────────────────────────────────────

export async function suspendMember(userId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update({ status: 'SUSPENDED', updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;

  revalidatePath(`/members/${userId}`);
  revalidatePath('/members');
}

// ─── Activate member ──────────────────────────────────────────────────────────

export async function activateMember(userId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;

  revalidatePath(`/members/${userId}`);
  revalidatePath('/members');
}
