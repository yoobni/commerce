/**
 * Badge — reusable status/label badge.
 *
 * Design guide:
 *   <Badge className="bg-green-100 text-green-700">활성</Badge>
 *   <Badge className="bg-red-100 text-red-700">취소</Badge>
 *   <Badge dot className="bg-yellow-100 text-yellow-700">대기</Badge>
 *
 * Always pass semantic Tailwind color pairs for consistent theming.
 */

import { cn } from '@/lib/cn';

interface BadgeProps {
  className?: string;
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({ className, dot, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        className
      )}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
