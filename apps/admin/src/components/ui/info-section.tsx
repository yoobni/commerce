/**
 * InfoSection — Card + 제목/액션 의 detail 페이지 표준 섹션.
 * Toss-style: 큰 padding, 또렷한 title, 옅은 border, no shadow.
 */
import * as React from 'react';
import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export interface InfoSectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function InfoSection({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: InfoSectionProps) {
  return (
    <Card className={cn('shadow-none', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3 pb-4 pt-5 px-6">
        <div className="min-w-0">
          <CardTitle className="text-[15px] font-semibold tracking-tight text-[var(--mz-ink)]">
            {title}
          </CardTitle>
          {description && (
            <p className="mt-1 text-[13px] text-[var(--mz-ink-mute)]">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent className={cn('px-6 pb-6', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
