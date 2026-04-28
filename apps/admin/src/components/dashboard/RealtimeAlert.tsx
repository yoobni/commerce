'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface NewOrder {
  id: string;
  order_number: string;
  total_amount: number;
  ordered_at: string;
  user_name: string | null;
}

interface RealtimeAlertProps {
  initialPendingCount: number;
}

export function RealtimeAlert({ initialPendingCount }: RealtimeAlertProps) {
  const [pendingCount, setPendingCount] = useState(initialPendingCount);
  const [newOrders, setNewOrders] = useState<NewOrder[]>([]);
  const [showList, setShowList] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch('/api/stats/pending', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { pendingCount: number; newOrders: NewOrder[] };
      setPendingCount(data.pendingCount);
      if (data.newOrders.length > 0) {
        setNewOrders((prev) => {
          const existingIds = new Set(prev.map((o) => o.id));
          const merged = [
            ...data.newOrders.filter((o) => !existingIds.has(o.id)),
            ...prev,
          ].slice(0, 5);
          return merged;
        });
        setDismissed(false);
      }
    } catch {
      // ignore network errors
    }
  }, []);

  useEffect(() => {
    const id = setInterval(fetchPending, 30_000);
    return () => clearInterval(id);
  }, [fetchPending]);

  if (dismissed || (pendingCount === 0 && newOrders.length === 0)) return null;

  return (
    <div className="relative">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm">
        {/* Bell icon */}
        <span className="text-amber-500 shrink-0" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 2a6 6 0 00-6 6v1.268l-.894 1.789A1 1 0 004 13h12a1 1 0 00.894-1.447L16 9.268V8a6 6 0 00-6-6zm0 16a2 2 0 01-2-2h4a2 2 0 01-2 2z" />
          </svg>
        </span>

        <span className="font-medium text-amber-800">
          처리 대기 주문{' '}
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
          건이 있습니다.
        </span>

        {newOrders.length > 0 && (
          <button
            onClick={() => setShowList((v) => !v)}
            className="text-xs text-amber-700 underline hover:no-underline ml-1"
          >
            {showList ? '닫기' : '최근 주문 보기'}
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/orders?status=PENDING_PAYMENT"
            className="text-xs font-medium text-amber-700 hover:underline"
          >
            주문 관리 →
          </Link>
          <button
            onClick={() => setDismissed(true)}
            aria-label="알림 닫기"
            className="text-amber-400 hover:text-amber-600 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {showList && newOrders.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[var(--color-border)] rounded-xl shadow-lg z-20 overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--color-border)] bg-gray-50">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
              최근 신규 결제대기 주문 (최대 5건)
            </p>
          </div>
          <ul className="divide-y divide-[var(--color-border)]">
            {newOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  onClick={() => setShowList(false)}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm"
                >
                  <span className="font-mono text-xs text-[var(--color-text-secondary)]">
                    {order.order_number}
                  </span>
                  <span className="text-[var(--color-text-primary)]">
                    {order.user_name ?? '(비회원)'}
                  </span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {order.total_amount.toLocaleString()}원
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {new Date(order.ordered_at).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
