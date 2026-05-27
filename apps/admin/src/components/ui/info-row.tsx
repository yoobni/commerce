/**
 * InfoRow — detail 페이지에서 라벨/값 줄을 표시하는 공통 패턴.
 * `<dl>` 안에 여러 개 배치하면 됨.
 */
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InfoRowProps {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function InfoRow({ label, children, className }: InfoRowProps) {
  return (
    <div className={cn('flex gap-4 border-b border-border py-2 last:border-0', className)}>
      <dt className="w-28 shrink-0 pt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="flex-1 text-[13px] text-foreground">{children}</dd>
    </div>
  );
}
