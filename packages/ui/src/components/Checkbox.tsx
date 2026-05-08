'use client';

import { forwardRef, useId } from 'react';
import { cn } from '../lib/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, error, className, id, disabled, ...props },
  ref
) {
  const autoId = useId();
  const checkId = id ?? autoId;
  const errorId = error ? `${checkId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={checkId}
        className={cn('flex items-start gap-3 cursor-pointer', disabled && 'cursor-not-allowed opacity-40')}
      >
        <input
          ref={ref}
          type="checkbox"
          id={checkId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={errorId}
          style={{ accentColor: 'var(--mz-ink)' }}
          className={cn(
            'mt-0.5 shrink-0 w-4 h-4 cursor-pointer',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mz-ink)]',
            'rounded-[var(--mz-radius-sm,4px)]',
            disabled && 'cursor-not-allowed',
            className
          )}
          {...props}
        />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-medium text-[var(--mz-ink)] leading-tight">{label}</span>
          {hint && !error && (
            <span className="text-xs text-[var(--mz-ink-mute)]">{hint}</span>
          )}
        </div>
      </label>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[var(--mz-error,#c0392b)] ml-7">
          {error}
        </p>
      )}
    </div>
  );
});
