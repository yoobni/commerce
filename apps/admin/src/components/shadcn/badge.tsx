import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-[11.5px] font-medium leading-[1.4] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // 일반
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-input text-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
        accent: 'border-transparent bg-accent text-accent-foreground',

        // 상태 신호 — admin
        // success (완료/배송완료/활성)
        success: 'border-transparent bg-[#dcefdc] text-[#1f6b3a]',
        // warning (대기/요청)
        warning: 'border-transparent bg-[#fef3c7] text-[#92400e]',
        // destructive (환불/실패/정지)
        destructive: 'border-transparent bg-[#fee2e2] text-[#b91c1c]',
        // info (결제완료/구매확정 — "처리됐음" 신호)
        info: 'border-transparent bg-[#dbeafe] text-[#1d4ed8]',
        // processing (배송중/준비중 — "진행 중" 신호)
        processing: 'border-transparent bg-[#ede9fe] text-[#6d28d9]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
