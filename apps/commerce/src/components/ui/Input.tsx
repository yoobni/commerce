'use client';

import { forwardRef, useId, useState } from 'react';
import { cn } from '@/lib/cn';

// Spec: Direction B — Input
// Border: 1px var(--mz-line), focus: 1.5px var(--mz-ink)
// Radius: 10. Padding: 14/16. Font: Inter 14/400
// Floating label: absolute top:-7px left:12px, bg page-bg, Inter 600/10, +0.14em uppercase
// Two modes: static label (default) | floating (floatingLabel=true)

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingAction?: React.ReactNode;
  /** Floating label activates on focus or when the field has a value */
  floatingLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    leadingIcon,
    trailingAction,
    floatingLabel = false,
    className,
    id,
    required,
    value,
    defaultValue,
    onFocus,
    onBlur,
    onChange,
    ...props
  },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(
    (defaultValue as string) ?? ''
  );

  // Determine whether the floating label should be "raised"
  const hasValue =
    value !== undefined
      ? String(value).length > 0
      : internalValue.length > 0;
  const isFloated = floatingLabel && (focused || hasValue);

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    setFocused(true);
    onFocus?.(e);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setFocused(false);
    onBlur?.(e);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (value === undefined) setInternalValue(e.target.value);
    onChange?.(e);
  }

  // ── Static label mode (original behaviour) ──────────────────────────────
  if (!floatingLabel) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--mz-ink)]"
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
            <span className="absolute left-3 text-[var(--mz-ink-mute)] pointer-events-none">
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
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            className={cn(
              'w-full h-12 px-4 rounded-[var(--radius-md)]',
              'bg-[var(--mz-surface)] text-[var(--mz-ink)] text-[14px]',
              'border border-[var(--mz-line)] placeholder:text-[var(--mz-ink-mute)]',
              'transition-[border,box-shadow] duration-150',
              'focus:outline-none focus:border-[var(--mz-ink)] focus:[border-width:1.5px]',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--mz-bg-deep)]',
              'read-only:bg-[var(--mz-bg-deep)] read-only:cursor-default',
              error && 'border-[var(--color-error)] focus:border-[var(--color-error)]',
              leadingIcon ? 'pl-10' : undefined,
              trailingAction ? 'pr-10' : undefined,
              className
            )}
            {...props}
          />

          {trailingAction && (
            <span className="absolute right-3 text-[var(--mz-ink-mute)]">
              {trailingAction}
            </span>
          )}
        </div>

        {hint && !error && (
          <p id={hintId} className="text-xs text-[var(--mz-ink-mute)]">
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
  }

  // ── Floating label mode ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative flex items-center">
        {/* Floating label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute pointer-events-none select-none transition-all duration-150',
              isFloated
                ? cn(
                    'top-0 -translate-y-1/2 left-3',
                    'px-1.5 py-0',
                    'text-[10px] font-semibold tracking-[0.14em] uppercase',
                    'bg-[var(--mz-surface)]',
                    error ? 'text-[var(--color-error)]' : 'text-[var(--mz-ink)]',
                  )
                : cn(
                    'top-1/2 -translate-y-1/2 left-4',
                    'text-[14px] font-normal',
                    'text-[var(--mz-ink-mute)]',
                  )
            )}
          >
            {label}
            {required && !isFloated && (
              <span className="text-[var(--color-error)] ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {leadingIcon && (
          <span className="absolute left-3 text-[var(--mz-ink-mute)] pointer-events-none">
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
          value={value}
          defaultValue={defaultValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            'w-full h-14 px-4 rounded-[var(--radius-md)]',
            'bg-[var(--mz-surface)] text-[var(--mz-ink)] text-[14px]',
            'border border-[var(--mz-line)] placeholder-transparent',
            'transition-[border,box-shadow] duration-150',
            'focus:outline-none focus:border-[var(--mz-ink)] focus:[border-width:1.5px]',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--mz-bg-deep)]',
            error && 'border-[var(--color-error)] focus:border-[var(--color-error)]',
            leadingIcon ? 'pl-10' : undefined,
            trailingAction ? 'pr-10' : undefined,
            className
          )}
          {...props}
        />

        {trailingAction && (
          <span className="absolute right-3 text-[var(--mz-ink-mute)]">
            {trailingAction}
          </span>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--mz-ink-mute)]">
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
