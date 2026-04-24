import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  sub,
  accent = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-5 border',
        accent
          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
          : 'bg-[var(--color-surface)] border-[var(--color-border)]',
        className
      )}
    >
      <p
        className={cn(
          'text-xs font-medium mb-1',
          accent ? 'text-white/70' : 'text-[var(--color-text-secondary)]'
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          'text-2xl font-bold tracking-tight',
          accent ? 'text-white' : 'text-[var(--color-text-primary)]'
        )}
      >
        {value}
      </p>
      {sub && (
        <p
          className={cn(
            'text-xs mt-1.5',
            accent ? 'text-white/60' : 'text-[var(--color-text-tertiary)]'
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
