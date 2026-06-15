// Pure UI labels/variants for the products domain.
// Safe to import from Client Components — has no fetch/cookies dependency.

import type { ProductStatus } from '@commerce/types';

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT: '임시저장',
  ACTIVE: '판매중',
  SOLD_OUT: '품절',
  HIDDEN: '숨김',
  DISCONTINUED: '단종',
};

export const PRODUCT_STATUS_VARIANT: Record<
  ProductStatus,
  'success' | 'muted' | 'warning' | 'info' | 'destructive'
> = {
  ACTIVE: 'success',
  DRAFT: 'muted',
  SOLD_OUT: 'warning',
  HIDDEN: 'info',
  DISCONTINUED: 'destructive',
};
