'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-cta)] text-white hover:opacity-90 active:opacity-80',
  secondary:
    'border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] bg-transparent hover:bg-[var(--color-neutral-50)] active:bg-[var(--color-neutral-100)]',
  ghost:
    'text-[var(--color-text-primary)] bg-transparent underline-offset-2 hover:underline active:opacity-70',
  danger:
    'bg-[var(--color-error)] text-white hover:opacity-90 active:opacity-80',
  accent:
    'bg-[var(--color-brand-accent)] text-[var(--color-brand-primary)] hover:opacity-90 active:opacity-80',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm min-w-[64px]',
  md: 'h-11 px-5 text-base min-w-[88px]',
  lg: 'h-[52px] px-7 text-lg min-w-[120px]',
  xl: 'h-[60px] px-8 text-lg min-w-[160px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
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
        'inline-flex items-center justify-center gap-2 rounded font-medium',
        'whitespace-nowrap max-w-full overflow-hidden text-ellipsis',
        'transition-opacity duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'opacity-40 cursor-not-allowed pointer-events-none',
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

function Spinner({ size }: { size: ButtonSize }) {
  const dim = size === 'sm' ? 14 : size === 'md' ? 16 : 20;
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
        strokeLinecap="round"
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
