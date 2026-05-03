'use client';

import { useState, useTransition } from 'react';
import { resolveReport, dismissReport, markReportReviewed } from '@/lib/actions/reports';
import type { ReportStatus, ReportAction } from '@commerce/types';

const ACTION_OPTIONS: Array<{ value: ReportAction; label: string }> = [
  { value: 'NONE', label: '조치 없음' },
  { value: 'WARNING', label: '경고' },
  { value: 'CONTENT_HIDDEN', label: '콘텐츠 숨김' },
  { value: 'USER_SUSPENDED', label: '회원 정지' },
];

interface Props {
  reportId: string;
  currentStatus: ReportStatus;
}

export function ReportActionButtons({ reportId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<ReportAction>('NONE');
  const [memo, setMemo] = useState('');

  function handleMarkReviewed() {
    startTransition(() => {
      markReportReviewed(reportId).catch(console.error);
    });
  }

  function handleResolve() {
    if (!confirm(`"${ACTION_OPTIONS.find((o) => o.value === action)?.label}" 조치로 처리하시겠습니까?`))
      return;
    startTransition(() => {
      resolveReport(reportId, action, memo).catch(console.error);
    });
  }

  function handleDismiss() {
    if (!confirm('이 신고를 기각 처리하시겠습니까?')) return;
    startTransition(() => {
      dismissReport(reportId, memo).catch(console.error);
    });
  }

  const isDone = currentStatus === 'RESOLVED' || currentStatus === 'DISMISSED';

  return (
    <div className="space-y-3">
      {/* Mark as reviewed */}
      {currentStatus === 'PENDING' && (
        <button
          onClick={handleMarkReviewed}
          disabled={pending}
          className="w-full py-2 text-sm font-medium border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-60 transition-colors"
        >
          검토 시작
        </button>
      )}

      {!isDone && (
        <>
          {/* Action select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase">
              처리 조치
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as ReportAction)}
              disabled={pending}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Admin memo */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase">
              관리자 메모
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              disabled={pending}
              placeholder="처리 사유나 메모를 입력하세요 (선택)"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleResolve}
              disabled={pending}
              className="flex-1 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              처리 완료
            </button>
            <button
              onClick={handleDismiss}
              disabled={pending}
              className="flex-1 py-2 text-sm font-medium border border-gray-300 text-[var(--color-text-secondary)] rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              기각
            </button>
          </div>
        </>
      )}

      {isDone && (
        <p className="text-sm text-center text-[var(--color-text-tertiary)] py-2">
          처리가 완료된 신고입니다.
        </p>
      )}
    </div>
  );
}
