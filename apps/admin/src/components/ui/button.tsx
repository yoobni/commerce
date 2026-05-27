/**
 * Admin Button — Muzzle 톤 적용.
 * variant: 'primary' (ink-on-bone) | 'secondary' (surface) | 'outline' | 'ghost' | 'destructive' | 'accent' (olive)
 * size: 'sm' | 'md' (default) | 'lg' | 'icon'
 *
 * 어드민 전역에서 이 래퍼만 import. shadcn 원본을 직접 import 금지.
 */
import * as React from 'react';
import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from '../shadcn/button';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'accent';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variantMap: Record<Variant, ShadcnButtonProps['variant']> = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  destructive: 'destructive',
  accent: 'accent',
};

const sizeMap: Record<Size, ShadcnButtonProps['size']> = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
  icon: 'icon',
};

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', ...props }, ref) => (
    <ShadcnButton ref={ref} variant={variantMap[variant]} size={sizeMap[size]} {...props} />
  ),
);
Button.displayName = 'Button';
