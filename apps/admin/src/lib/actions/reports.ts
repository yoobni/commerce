'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { getSession } from '@/lib/auth/session';
import type { ReportAction } from '@commerce/types';

// ─── Resolve report (처리 완료) ───────────────────────────────────────────────

export async function resolveReport(
  reportId: string,
  action: ReportAction,
  adminMemo: string
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reports') as any)
    .update({
      status: 'RESOLVED',
      action_taken: action,
      admin_memo: adminMemo || null,
      reviewed_by: session.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId);
  if (error) throw error;

  revalidatePath(`/reports/${reportId}`);
  revalidatePath('/reports');
}

// ─── Dismiss report (기각) ────────────────────────────────────────────────────

export async function dismissReport(reportId: string, adminMemo: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reports') as any)
    .update({
      status: 'DISMISSED',
      action_taken: 'NONE',
      admin_memo: adminMemo || null,
      reviewed_by: session.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId);
  if (error) throw error;

  revalidatePath(`/reports/${reportId}`);
  revalidatePath('/reports');
}

// ─── Mark as reviewed (검토 중으로 변경) ──────────────────────────────────────

export async function markReportReviewed(reportId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reports') as any)
    .update({
      status: 'REVIEWED',
      reviewed_by: session.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .eq('status', 'PENDING');
  if (error) throw error;

  revalidatePath(`/reports/${reportId}`);
  revalidatePath('/reports');
}
