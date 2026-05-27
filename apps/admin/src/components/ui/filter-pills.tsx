/**
 * FilterPills — URL 기반 상태 필터 pill 그룹. JS 없이 Link로만 동작.
 * 어드민 list 화면의 status tab 패턴을 대체.
 */
import * as React from 'react';
import Link from 'next/link';
import { Card } from './card';
import { cn } from '@/lib/cn';

export interface FilterPill<TValue extends string = string> {
  value: TValue;
  label: React.ReactNode;
}

export interface FilterPillsProps<TValue extends string = string> {
  pills: ReadonlyArray<FilterPill<TValue>>;
  activeValue: TValue;
  /** value를 받아 이동할 URL을 반환. */
  buildHref: (value: TValue) => string;
  /** 카드로 감쌀지 (기본 false — 다른 요소와 한 줄에 배치할 때 깔끔). */
  wrapInCard?: boolean;
  className?: string;
}

export function FilterPills<TValue extends string = string>({
  pills,
  activeValue,
  buildHref,
  wrapInCard = false,
  className,
}: FilterPillsProps<TValue>) {
  const content = (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {pills.map((pill) => {
        const active = pill.value === activeValue;
        return (
          <Link
            key={pill.value}
            href={buildHref(pill.value)}
            className={cn(
              'rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors',
              active
                ? 'bg-[var(--mz-ink)] text-white'
                : 'bg-muted text-foreground hover:bg-secondary',
            )}
            aria-current={active ? 'page' : undefined}
          >
            {pill.label}
          </Link>
        );
      })}
    </div>
  );

  if (!wrapInCard) return content;
  return <Card className="p-3">{content}</Card>;
}
