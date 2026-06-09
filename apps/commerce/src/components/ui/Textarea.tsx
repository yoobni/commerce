'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

// Mirrors Input's static-label spec, sized for multi-line entry.
// Border: 1px var(--mz-line), focus 1.5px var(--mz-ink), radius var(--radius-md).

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Show "{used} / {max}" counter under the field. Requires `maxLength`. */
  showCounter?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    showCounter,
    className,
    id,
    required,
    value,
    maxLength,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const used = typeof value === 'string' ? value.length : 0;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-[var(--mz-ink)]">
          {label}
          {required && (
            <span className="text-[var(--color-error)] ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <textarea
        ref={ref}
        id={fieldId}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        value={value}
        maxLength={maxLength}
        className={cn(
          'w-full px-4 py-3 rounded-[var(--radius-md)]',
          'bg-[var(--mz-surface)] text-[var(--mz-ink)] text-[14px] leading-relaxed',
          'border border-[var(--mz-line)] placeholder:text-[var(--mz-ink-mute)]',
          'transition-[border,box-shadow] duration-150 resize-y',
          // Override global :focus-visible outline (defined in globals.css)
          // so the border-color change carries the focus signal alone — no
          // doubled-up ring around the frame.
          'outline-none focus:outline-none focus-visible:outline-none',
          'focus:border-[var(--mz-ink)]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--mz-bg-deep)]',
          'read-only:bg-[var(--mz-bg-deep)] read-only:cursor-default',
          error && 'border-[var(--color-error)] focus:border-[var(--color-error)]',
          className,
        )}
        {...props}
      />

      <div className="flex items-center justify-between gap-2 min-h-[1rem]">
        <div className="text-xs text-[var(--mz-ink-mute)]">
          {error ? (
            <span id={errorId} role="alert" className="text-[var(--color-error)]">
              {error}
            </span>
          ) : hint ? (
            <span id={hintId}>{hint}</span>
          ) : null}
        </div>
        {showCounter && maxLength != null && (
          <div className="text-xs text-[var(--mz-ink-mute)] tabular-nums shrink-0">
            {used} / {maxLength}
          </div>
        )}
      </div>
    </div>
  );
});
