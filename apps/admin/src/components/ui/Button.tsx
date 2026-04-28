'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export type AdminButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type AdminButtonSize = 'sm' | 'md' | 'lg';

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const variantClasses: Record<AdminButtonVariant, string> = {
  primary: 'bg-[var(--color-sidebar)] text-white hover:opacity-90',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[#f9fafb]',
  danger:
    'bg-[var(--color-surface)] text-[var(--color-error)] border border-[#fca5a5] hover:bg-[#fef2f2]',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[#f9fafb]',
};

const sizeClasses: Record<AdminButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-1.5',
  lg: 'h-10 px-5 text-sm gap-2',
};

export const Button = forwardRef<HTMLButtonElement, AdminButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'border border-transparent whitespace-nowrap',
        'transition-[opacity,background] duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size} />
          <span className="sr-only">Loading</span>
        </>
      ) : (
        <>
          {leadingIcon && <span className="shrink-0">{leadingIcon}</span>}
          {children}
          {trailingIcon && <span className="shrink-0">{trailingIcon}</span>}
        </>
      )}
    </button>
  );
});

function Spinner({ size }: { size: AdminButtonSize }) {
  const dim = size === 'sm' ? 12 : 14;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="31.4"
        strokeDashoffset="10"
        opacity="0.3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
