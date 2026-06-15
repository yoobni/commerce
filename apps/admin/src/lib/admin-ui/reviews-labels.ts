// Pure UI labels/variants for the reviews domain. Safe for client imports.

import type { ReviewStatus, SizeFeedback } from '@commerce/types';

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  ACTIVE: '노출',
  HIDDEN: '숨김',
  DELETED: '삭제',
};

export const REVIEW_STATUS_VARIANT: Record<
  ReviewStatus,
  'success' | 'warning' | 'destructive'
> = {
  ACTIVE: 'success',
  HIDDEN: 'warning',
  DELETED: 'destructive',
};

export const SIZE_FEEDBACK_LABEL: Record<SizeFeedback, string> = {
  SMALL: '작음',
  PERFECT: '적합',
  LARGE: '큼',
};
