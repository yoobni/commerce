'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import type { ActivityItem } from '@/lib/queries/stats';
import { fetchRecentActivity } from '@/lib/actions/stats';

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  return `${Math.floor(diff / 3600)}시간 전`;
}

export function RealtimeAlerts({ initial }: { initial: ActivityItem[] }) {
  const [items, setItems] = useState<ActivityItem[]>(initial);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const fresh = await fetchRecentActivity(60);
      setItems(fresh);
      setLastUpdated(new Date());
    });
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)] bg-gray-50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">실시간 활동</h2>
        </div>
        <span className="text-xs text-[var(--color-text-tertiary)]">
          {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 기준
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]">
        {items.length === 0 ? (
          <div className="py-10 text-center text-sm text-[var(--color-text-tertiary)]">
            최근 1시간 내 활동 없음
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 px-4 py-3">
              <div
                className={
                  item.type === 'order'
                    ? 'w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5'
                    : 'w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5'
                }
                aria-hidden="true"
              >
                {item.type === 'order' ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-3.5 h-3.5 text-blue-600"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-3.5 h-3.5 text-emerald-600"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                  {item.label}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] truncate">{item.detail}</p>
              </div>
              <span className="text-xs text-[var(--color-text-tertiary)] shrink-0 mt-0.5">
                {timeAgo(item.time)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
