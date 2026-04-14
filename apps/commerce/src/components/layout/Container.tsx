import { cn } from '@/lib/cn';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Narrow: centers form content */
  narrow?: boolean;
  as?: React.ElementType;
}

/**
 * Responsive content container.
 * Mobile: full-width with horizontal padding.
 * Desktop: capped at --container-max (1280px), centered.
 */
export function Container({
  children,
  className,
  narrow = false,
  as: Tag = 'div',
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'w-full mx-auto',
        'px-[var(--container-padding)] md:px-[var(--container-padding-md)] lg:px-[var(--container-padding-lg)]',
        narrow ? 'max-w-[480px]' : 'max-w-[var(--container-max)]',
        className
      )}
    >
      {children}
    </Tag>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export interface PageProps {
  children: React.ReactNode;
  className?: string;
}

export function Page({ children, className }: PageProps) {
  return (
    <main
      className={cn(
        'min-h-screen bg-[var(--color-bg)]',
        // iOS safe area
        'pb-[max(1.5rem,env(safe-area-inset-bottom))]',
        'pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
        className
      )}
    >
      {children}
    </main>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function Section({ children, className, as: Tag = 'section' }: SectionProps) {
  return (
    <Tag className={cn('py-10 md:py-14 lg:py-20', className)}>
      {children}
    </Tag>
  );
}
