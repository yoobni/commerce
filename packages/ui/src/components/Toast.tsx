'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { cn } from '../lib/cn';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';

export interface ToastItem {
  id: string;
  variant?: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantClasses: Record<ToastVariant, string> = {
  default: 'bg-[var(--mz-ink)] text-[var(--mz-bg)]',
  success: 'bg-[var(--mz-success,#27ae60)] text-white',
  error:   'bg-[var(--mz-error,#c0392b)] text-white',
  warning: 'bg-[var(--mz-warning,#d68910)] text-white',
  info:    'bg-[#2563eb] text-white',
};

const positionClasses: Record<ToastPosition, string> = {
  'top-center':    'top-4 left-1/2 -translate-x-1/2 flex-col items-center',
  'top-right':     'top-4 right-4 flex-col items-end',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 flex-col-reverse items-center',
  'bottom-right':  'bottom-4 right-4 flex-col-reverse items-end',
};

const DURATION_DEFAULT = 4000;

export function ToastProvider({
  children,
  position = 'bottom-center',
}: {
  children: React.ReactNode;
  position?: ToastPosition;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      const duration = item.duration ?? DURATION_DEFAULT;
      setToasts((prev) => [...prev, { ...item, id }]);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        className={cn(
          'fixed z-[100] flex gap-2 pointer-events-none',
          positionClasses[position]
        )}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  return (
    <div
      role="alert"
      style={{ animation: 'mz-fade-rise 200ms ease forwards' }}
      className={cn(
        'pointer-events-auto flex items-start gap-3',
        'min-w-[260px] max-w-[360px] px-4 py-3',
        'rounded-[var(--mz-radius-md,10px)]',
        'shadow-[0_4px_20px_rgba(14,14,12,0.18)]',
        variantClasses[item.variant ?? 'default']
      )}
    >
      <div className="flex-1 min-w-0">
        {item.title && (
          <p className="text-[13px] font-semibold leading-tight mb-0.5 truncate">{item.title}</p>
        )}
        <p className="text-[13px] leading-snug">{item.message}</p>
        {item.action && (
          <button
            type="button"
            onClick={() => { item.action!.onClick(); onDismiss(item.id); }}
            className="mt-1.5 text-[12px] font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            {item.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="shrink-0 mt-0.5 opacity-70 hover:opacity-100 transition-opacity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
