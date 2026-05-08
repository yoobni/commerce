'use client';

import { forwardRef, useId } from 'react';
import { cn } from '../lib/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, className, id, required, ...props },
  ref
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-[var(--mz-ink)]">
          {label}
          {required && (
            <span className="text-[var(--mz-error,#c0392b)] ml-1" aria-hidden="true">*</span>
          )}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            'w-full h-12 pl-4 pr-10 rounded-[var(--mz-radius-md,10px)]',
            'bg-[var(--mz-surface)] text-[var(--mz-ink)] text-[14px]',
            'border border-[var(--mz-line)]',
            'transition-[border] duration-150 appearance-none cursor-pointer',
            'focus:outline-none focus:border-[var(--mz-ink)] focus:[border-width:1.5px]',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--mz-bg-deep)]',
            error && 'border-[var(--mz-error,#c0392b)] focus:border-[var(--mz-error,#c0392b)]',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--mz-ink-mute)]"
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--mz-ink-mute)]">{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[var(--mz-error,#c0392b)]">{error}</p>
      )}
    </div>
  );
});
