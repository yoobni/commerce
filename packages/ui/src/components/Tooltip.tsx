'use client';

import { cloneElement, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  children: React.ReactElement;
  className?: string;
}

const placementClasses: Record<TooltipPlacement, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<TooltipPlacement, string> = {
  top:    'top-full left-1/2 -translate-x-1/2 border-t-[var(--mz-ink)] border-x-transparent border-b-0',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--mz-ink)] border-x-transparent border-t-0',
  left:   'left-full top-1/2 -translate-y-1/2 border-l-[var(--mz-ink)] border-y-transparent border-r-0',
  right:  'right-full top-1/2 -translate-y-1/2 border-r-[var(--mz-ink)] border-y-transparent border-l-0',
};

export function Tooltip({
  content,
  placement = 'top',
  delay = 300,
  children,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).slice(2)}`).current;

  const show = useCallback(() => {
    timer.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setVisible(false);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {cloneElement(children, {
        'aria-describedby': visible ? tooltipId : undefined,
      } as React.HTMLAttributes<HTMLElement>)}
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          style={{ animation: 'mz-fade-rise 150ms ease forwards' }}
          className={cn(
            'absolute z-50 pointer-events-none',
            'px-2.5 py-1.5 rounded-[var(--mz-radius-sm,4px)]',
            'bg-[var(--mz-ink)] text-[var(--mz-bg)]',
            'text-[11px] font-medium leading-tight whitespace-nowrap',
            'shadow-[0_2px_8px_rgba(14,14,12,0.2)]',
            placementClasses[placement],
            className
          )}
        >
          {content}
          <span
            className={cn(
              'absolute w-0 h-0',
              'border-[5px] border-solid',
              arrowClasses[placement]
            )}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
}
