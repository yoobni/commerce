/**
 * Tag — Badge보다 가벼운 인라인 태그. 카테고리/필터 칩 등에 사용.
 * 클릭/제거 가능한 경우엔 onRemove 핸들러 제공.
 */
import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
  removable?: boolean;
}

export function Tag({ className, children, removable, onRemove, ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-input bg-card px-2 py-0.5 text-[12px] font-medium text-foreground',
        className,
      )}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="태그 제거"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
