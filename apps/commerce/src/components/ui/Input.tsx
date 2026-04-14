'use client';

import { forwardRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingAction?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leadingIcon, trailingAction, className, id, required, ...props },
  ref
) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
          {required && (
            <span className="text-[var(--color-error)] ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {leadingIcon && (
          <span className="absolute left-3 text-[var(--color-text-tertiary)] pointer-events-none">
            {leadingIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            'w-full h-11 px-3 rounded border bg-white text-[var(--color-text-primary)] text-base',
            'border-[var(--color-border)] placeholder:text-[var(--color-text-tertiary)]',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--color-neutral-50)]',
            'read-only:bg-[var(--color-neutral-50)] read-only:cursor-default',
            error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]',
            leadingIcon ? 'pl-10' : undefined,
            trailingAction ? 'pr-10' : undefined,
            className
          )}
          {...props}
        />

        {trailingAction && (
          <span className="absolute right-3 text-[var(--color-text-tertiary)]">
            {trailingAction}
          </span>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--color-text-tertiary)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[var(--color-error)]">
          {error}
        </p>
      )}
    </div>
  );
});

// ─── Password Input ───────────────────────────────────────────────────────────

export function PasswordInput(props: Omit<InputProps, 'type' | 'trailingAction'>) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      trailingAction={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="p-1 hover:opacity-70 transition-opacity"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
