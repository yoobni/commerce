/**
 * PageHeader — 어드민 도메인 페이지의 상단 헤더 패턴.
 * title + 부제(description) + 우측 액션 슬롯.
 * Breadcrumb는 별도 컴포넌트(<Breadcrumb>)로 위에 따로 배치.
 */
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
