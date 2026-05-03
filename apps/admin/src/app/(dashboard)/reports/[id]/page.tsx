import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReportStatus, ReportAction } from '@commerce/types';
import {
  adminGetReport,
  REPORT_STATUS_LABEL,
  REPORT_STATUS_BADGE,
  REPORT_TARGET_LABEL,
  REPORT_REASON_LABEL,
} from '@/lib/queries/reports';
import { ReportActionButtons } from './_components/ReportActionButtons';

export const metadata = { title: '신고 상세' };

const REPORT_ACTION_LABEL: Record<ReportAction, string> = {
  NONE: '조치 없음',
  WARNING: '경고',
  CONTENT_HIDDEN: '콘텐츠 숨김',
  USER_SUSPENDED: '회원 정지',
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--color-border)] bg-gray-50">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-2 border-b border-[var(--color-border-subtle)] last:border-0">
      <dt className="w-24 shrink-0 text-xs font-medium text-[var(--color-text-tertiary)] pt-0.5">
        {label}
      </dt>
      <dd className="flex-1 text-sm text-[var(--color-text-primary)]">{children}</dd>
    </div>
  );
}

function TargetLink({ targetType, targetId }: { targetType: string; targetId: string }) {
  const href =
    targetType === 'POST'
      ? `/community/${targetId}`
      : targetType === 'COMMENT'
        ? `/community` // 댓글은 게시글 상세로 이동 어려움 — 목록으로
        : targetType === 'REVIEW'
          ? `/reviews/${targetId}`
          : targetType === 'USER'
            ? `/members/${targetId}`
            : null;

  if (!href) return <span className="font-mono text-xs">{targetId}</span>;

  return (
    <Link href={href} className="text-blue-500 hover:underline font-mono text-xs">
      {targetId} →
    </Link>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  const report = await adminGetReport(id);
  if (!report) notFound();

  return (
    <div className="max-w-4xl">
      <Link
        href="/reports"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        ← 신고 목록
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">신고 상세</h1>
        <span
          className={`px-2.5 py-1 rounded-full text-sm font-medium ${REPORT_STATUS_BADGE[report.status as ReportStatus]}`}
        >
          {REPORT_STATUS_LABEL[report.status as ReportStatus]}
        </span>
        <span className="px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
          {REPORT_TARGET_LABEL[report.target_type]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Main ── */}
        <div className="col-span-2 space-y-4">
          {/* Report info */}
          <SectionCard title="신고 내용">
            <dl>
              <InfoRow label="신고 유형">{REPORT_TARGET_LABEL[report.target_type]}</InfoRow>
              <InfoRow label="대상 ID">
                <TargetLink targetType={report.target_type} targetId={report.target_id} />
              </InfoRow>
              <InfoRow label="신고 사유">{REPORT_REASON_LABEL[report.reason]}</InfoRow>
              {report.detail && (
                <InfoRow label="상세 내용">
                  <p className="whitespace-pre-wrap leading-relaxed">{report.detail}</p>
                </InfoRow>
              )}
              <InfoRow label="신고일">
                {new Date(report.created_at).toLocaleString('ko-KR')}
              </InfoRow>
            </dl>
          </SectionCard>

          {/* Reporter */}
          <SectionCard title="신고자">
            {report.reporter ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {report.reporter.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">{report.reporter.email}</p>
                </div>
                <Link
                  href={`/members/${report.reporter_id}`}
                  className="text-xs text-blue-500 hover:underline"
                >
                  회원 상세 →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-tertiary)]">탈퇴 회원</p>
            )}
          </SectionCard>

          {/* Processing result */}
          {(report.status === 'RESOLVED' || report.status === 'DISMISSED') && (
            <SectionCard title="처리 결과">
              <dl>
                <InfoRow label="처리 상태">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${REPORT_STATUS_BADGE[report.status as ReportStatus]}`}
                  >
                    {REPORT_STATUS_LABEL[report.status as ReportStatus]}
                  </span>
                </InfoRow>
                {report.action_taken && (
                  <InfoRow label="조치 내용">
                    {REPORT_ACTION_LABEL[report.action_taken as ReportAction]}
                  </InfoRow>
                )}
                {report.admin_memo && (
                  <InfoRow label="관리자 메모">
                    <p className="whitespace-pre-wrap leading-relaxed text-[var(--color-text-secondary)]">
                      {report.admin_memo}
                    </p>
                  </InfoRow>
                )}
                {report.reviewed_at && (
                  <InfoRow label="처리일">
                    {new Date(report.reviewed_at).toLocaleString('ko-KR')}
                  </InfoRow>
                )}
              </dl>
            </SectionCard>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="col-span-1 space-y-4">
          {/* Action */}
          <SectionCard title="신고 처리">
            <ReportActionButtons
              reportId={report.id}
              currentStatus={report.status as ReportStatus}
            />
          </SectionCard>

          {/* Meta */}
          <SectionCard title="메타">
            <dl className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              <div className="flex justify-between">
                <dt>신고 ID</dt>
                <dd className="font-mono truncate ml-2 max-w-[100px]">{report.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt>신고일</dt>
                <dd>{new Date(report.created_at).toLocaleDateString('ko-KR')}</dd>
              </div>
              {report.reviewed_at && (
                <div className="flex justify-between">
                  <dt>처리일</dt>
                  <dd>{new Date(report.reviewed_at).toLocaleDateString('ko-KR')}</dd>
                </div>
              )}
            </dl>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
