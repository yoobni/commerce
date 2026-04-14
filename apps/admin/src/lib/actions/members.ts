'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { getSession } from '@/lib/auth/session';
import type { SanctionType } from '@/lib/queries/members';

// ─── Suspend member ───────────────────────────────────────────────────────────

export interface SuspendMemberInput {
  userId: string;
  type: SanctionType;
  reason: string;
  endsAt: string | null; // ISO string or null for permanent
}

export async function suspendMember(input: SuspendMemberInput): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();

  // Insert sanction record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: sanctionError } = await (supabase.from('sanctions') as any).insert({
    user_id: input.userId,
    type: input.type,
    reason: input.reason,
    ends_at: input.endsAt,
    is_active: true,
    created_by: session.id,
  });
  if (sanctionError) throw sanctionError;

  // Update user status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: userError } = await (supabase.from('users') as any)
    .update({ status: 'SUSPENDED', updated_at: new Date().toISOString() })
    .eq('id', input.userId);
  if (userError) throw userError;

  revalidatePath(`/members/${input.userId}`);
  revalidatePath('/members');
}

// ─── Unsuspend member ─────────────────────────────────────────────────────────

export async function unsuspendMember(userId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();

  // Deactivate all active sanctions for this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: sanctionError } = await (supabase.from('sanctions') as any)
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true);
  if (sanctionError) throw sanctionError;

  // Restore user status to ACTIVE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: userError } = await (supabase.from('users') as any)
    .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (userError) throw userError;

  revalidatePath(`/members/${userId}`);
  revalidatePath('/members');
}

// ─── Grant points ─────────────────────────────────────────────────────────────

export interface GrantPointsInput {
  userId: string;
  amount: number;
  reason: string;
}

export async function grantPoints(input: GrantPointsInput): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  if (input.amount <= 0) throw new Error('Amount must be positive');

  const supabase = createServiceClient();

  // Get or create points row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data: pointRow } = await (supabase.from('points') as any)
    .select('balance, total_earned')
    .eq('user_id', input.userId)
    .single();

  const currentBalance: number = (pointRow as { balance: number; total_earned: number } | null)?.balance ?? 0;
  const currentEarned: number = (pointRow as { balance: number; total_earned: number } | null)?.total_earned ?? 0;
  const newBalance = currentBalance + input.amount;

  if (!pointRow) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('points') as any).insert({
      user_id: input.userId,
      balance: input.amount,
      total_earned: input.amount,
      total_used: 0,
      total_expired: 0,
    });
    if (error) throw error;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('points') as any)
      .update({
        balance: newBalance,
        total_earned: currentEarned + input.amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', input.userId);
    if (error) throw error;
  }

  // Insert point transaction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: txError } = await (supabase.from('point_transactions') as any).insert({
    user_id: input.userId,
    type: 'ADMIN_GRANT',
    amount: input.amount,
    balance_after: newBalance,
    reason: input.reason,
    reference_type: 'ADMIN',
    created_by: session.id,
  });
  if (txError) throw txError;

  revalidatePath(`/members/${input.userId}`);
}
