/**
 * Admin report queries — uses service-role client (bypasses RLS).
 */

import type {
  Report,
  ReportStatus,
  ReportTargetType,
  User,
  PaginatedResponse,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Extended types ───────────────────────────────────────────────────────────

export interface AdminReportRow extends Report {
  reporter?: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface AdminReportDetail extends Report {
  reporter?: Pick<User, 'id' | 'name' | 'email'> | null;
}

// ─── Status label & badge ─────────────────────────────────────────────────────

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: '대기',
  REVIEWED: '검토 중',
  RESOLVED: '처리 완료',
  DISMISSED: '기각',
};

export const REPORT_STATUS_BADGE: Record<ReportStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  REVIEWED: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  DISMISSED: 'bg-gray-100 text-gray-500',
};

export const REPORT_TARGET_LABEL: Record<ReportTargetType, string> = {
  POST: '게시글',
  COMMENT: '댓글',
  REVIEW: '리뷰',
  USER: '회원',
};

export const REPORT_REASON_LABEL: Record<Report['reason'], string> = {
  SPAM: '스팸',
  ABUSE: '욕설/혐오',
  INAPPROPRIATE: '부적절한 콘텐츠',
  FRAUD: '사기',
  OTHER: '기타',
};

// ─── Params ───────────────────────────────────────────────────────────────────

export interface AdminReportListParams {
  status?: ReportStatus | 'ALL';
  targetType?: ReportTargetType | 'ALL';
  page?: number;
  per_page?: number;
}

// ─── Report list ──────────────────────────────────────────────────────────────

export async function adminListReports(
  params: AdminReportListParams = {}
): Promise<PaginatedResponse<AdminReportRow>> {
  const { status = 'ALL', targetType = 'ALL', page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('reports') as any).select(
    '*, reporter:users!reporter_id(id, name, email)',
    { count: 'exact' }
  );

  if (status !== 'ALL') query = query.eq('status', status);
  if (targetType !== 'ALL') query = query.eq('target_type', targetType);

  query = query.order('created_at', { ascending: false }).range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as AdminReportRow[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

// ─── Report detail ────────────────────────────────────────────────────────────

export async function adminGetReport(id: string): Promise<AdminReportDetail | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('reports') as any)
    .select('*, reporter:users!reporter_id(id, name, email)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as AdminReportDetail;
}
