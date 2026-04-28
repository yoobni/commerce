'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

// ─── Text Input ───────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, leadingIcon, trailingIcon, className, id, required, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[var(--color-text-secondary)]"
        >
          {label}
          {required && <span className="ml-0.5 text-[var(--color-error)]">*</span>}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-hint` : undefined}
          className={cn(
            'admin-input',
            !!leadingIcon && 'pl-8',
            !!trailingIcon && 'pr-8',
            error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]',
            className
          )}
          {...props}
        />
        {trailingIcon && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
            {trailingIcon}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-[var(--color-error)]">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-hint`} className="text-xs text-[var(--color-text-tertiary)]">
          {helperText}
        </p>
      )}
    </div>
  );
});

// ─── Select ───────────────────────────────────────────────────────────────────

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, helperText, placeholder, className, id, required, children, ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium text-[var(--color-text-secondary)]"
        >
          {label}
          {required && <span className="ml-0.5 text-[var(--color-error)]">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-hint` : undefined}
          className={cn(
            'admin-input appearance-none pr-8 cursor-pointer',
            error && 'border-[var(--color-error)]',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-tertiary)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {error && (
        <p id={`${selectId}-error`} role="alert" className="text-xs text-[var(--color-error)]">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${selectId}-hint`} className="text-xs text-[var(--color-text-tertiary)]">
          {helperText}
        </p>
      )}
    </div>
  );
});

// ─── Textarea ─────────────────────────────────────────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, helperText, className, id, required, ...props },
  ref
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-medium text-[var(--color-text-secondary)]"
        >
          {label}
          {required && <span className="ml-0.5 text-[var(--color-error)]">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-hint` : undefined}
        className={cn(
          'admin-input resize-y min-h-[80px]',
          error && 'border-[var(--color-error)]',
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} role="alert" className="text-xs text-[var(--color-error)]">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${textareaId}-hint`} className="text-xs text-[var(--color-text-tertiary)]">
          {helperText}
        </p>
      )}
    </div>
  );
});
