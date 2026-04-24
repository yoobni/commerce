import Link from 'next/link';
import { cn } from '@/lib/cn';

interface SectionCardProps {
  title?: string;
  titleHref?: string;
  titleAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({
  title,
  titleHref,
  titleAction,
  children,
  className,
  noPadding = false,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden',
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          {titleHref && (
            <Link
              href={titleHref}
              className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              전체 보기 →
            </Link>
          )}
          {titleAction}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </section>
  );
}
