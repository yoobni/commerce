/**
 * PageHeader — 어드민 도메인 페이지의 상단 헤더 패턴.
 * title + 부제(description) + 우측 액션 슬롯 + (선택) 뒤로가기 링크.
 * Breadcrumb는 별도 컴포넌트(<Breadcrumb>)로 위에 따로 배치.
 */
import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Optional back link (renders an arrow + label row above the title). */
  back?: { href: string; label: string };
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  back,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      {back && (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--mz-ink-mute)] transition-colors hover:text-[var(--mz-ink)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold leading-tight tracking-[-0.015em] text-[var(--mz-ink)]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-[14px] text-[var(--mz-ink-soft)]">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
