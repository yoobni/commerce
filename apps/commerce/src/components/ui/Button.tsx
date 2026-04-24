'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

// Spec: Direction B — 4 variants
// primary  → bg ink, fg bg      — core CTA, 1 per view
// accent   → bg accent, fg white — Fit/commit moments
// ghost    → transparent + border 1px lineStrong, fg ink — secondary action
// quiet    → text-only, fg inkMute — tertiary / cancel
// danger   → system use only (kept for admin/destructive flows)
//
// Legacy compat: existing `secondary` code → ghost styling, `ghost` code → quiet styling

export type ButtonVariant = 'primary' | 'accent' | 'ghost' | 'quiet' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--mz-ink)] text-[var(--mz-bg)] hover:opacity-85 active:opacity-75',
  accent:
    'bg-[var(--mz-accent)] text-white hover:opacity-90 active:opacity-80',
  ghost:
    'border border-[var(--mz-line-strong)] text-[var(--mz-ink)] bg-transparent hover:bg-[var(--mz-bg-deep)] active:bg-[var(--mz-bg-deep)]',
  quiet:
    'text-[var(--mz-ink-mute)] bg-transparent hover:text-[var(--mz-ink)] active:opacity-70',
  // Legacy alias → ghost styling
  secondary:
    'border border-[var(--mz-line-strong)] text-[var(--mz-ink)] bg-transparent hover:bg-[var(--mz-bg-deep)] active:bg-[var(--mz-bg-deep)]',
  danger:
    'bg-[var(--color-error)] text-white hover:opacity-90 active:opacity-80',
};

// Spec: sm 40 · md 48 · lg 56 (px)
// Padding-x: 20px — Inter 500/13, letter-spacing +0.02em
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-5 text-[13px] min-w-[72px]',
  md: 'h-12 px-5 text-[13px] min-w-[88px]',
  lg: 'h-14 px-5 text-[13px] min-w-[120px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
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
        'inline-flex items-center justify-center gap-2',
        'rounded-[var(--radius-md)] font-medium tracking-[0.02em]',
        'whitespace-nowrap overflow-hidden',
        'transition-[opacity,background-color,color] duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mz-ink)]',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
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
