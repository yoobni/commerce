'use client';

import { forwardRef, useId } from 'react';
import { cn } from '../lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, required, rows = 4, ...props },
  ref
) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-[var(--mz-ink)]">
          {label}
          {required && (
            <span className="text-[var(--mz-error,#c0392b)] ml-1" aria-hidden="true">*</span>
          )}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 rounded-[var(--mz-radius-md,10px)]',
          'bg-[var(--mz-surface)] text-[var(--mz-ink)] text-[14px]',
          'border border-[var(--mz-line)] placeholder:text-[var(--mz-ink-mute)]',
          'transition-[border] duration-150 resize-y',
          'focus:outline-none focus:border-[var(--mz-ink)] focus:[border-width:1.5px]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--mz-bg-deep)]',
          error && 'border-[var(--mz-error,#c0392b)] focus:border-[var(--mz-error,#c0392b)]',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--mz-ink-mute)]">{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[var(--mz-error,#c0392b)]">{error}</p>
      )}
    </div>
  );
});
