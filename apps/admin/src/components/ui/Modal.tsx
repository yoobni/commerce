'use client';

import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export type AdminModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: AdminModalSize;
  /** Prevent close on overlay click */
  persistent?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<AdminModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
};

export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  persistent = false,
  children,
  footer,
  className,
}: AdminModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`admin-modal-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, persistent, onClose]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={persistent ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative z-10 w-full bg-[var(--color-surface)] rounded-xl shadow-xl flex flex-col max-h-[90vh]',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
            <h2
              id={titleId}
              className="text-base font-semibold text-[var(--color-text-primary)]"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors -mr-1"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      persistent
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="sm"
            loading={loading}
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && (
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{message}</p>
      )}
    </Modal>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
