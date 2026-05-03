'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SyncShipmentButtonProps {
  shipmentId: string;
  hasExternalTracker: boolean;
  lastSyncedAt: string | null;
}

export function SyncShipmentButton({
  shipmentId,
  hasExternalTracker,
  lastSyncedAt,
}: SyncShipmentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hasExternalTracker) {
    return (
      <p className="text-xs text-[var(--color-text-tertiary)]">
        외부 Tracker 미연동 (AFTERSHIP_API_KEY 필요)
      </p>
    );
  }

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/shipments/${shipmentId}/sync`, { method: 'POST' });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? '동기화 실패');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleSync}
        disabled={loading}
        className="w-full py-2 text-sm font-medium border border-violet-300 text-violet-700 rounded-lg hover:bg-violet-50 disabled:opacity-50 transition-colors"
      >
        {loading ? '동기화 중…' : '외부 상태 동기화'}
      </button>
      {lastSyncedAt && (
        <p className="text-xs text-center text-[var(--color-text-tertiary)]">
          마지막 동기화: {new Date(lastSyncedAt).toLocaleString('ko-KR')}
        </p>
      )}
      {error && <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{error}</p>}
    </div>
  );
}
