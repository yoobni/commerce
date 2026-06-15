// Pure UI labels/variants for the community domain. Safe for client imports.

import type { BoardType, PostStatus } from '@commerce/types';

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  ACTIVE: '노출',
  HIDDEN: '숨김',
  DELETED: '삭제',
};

export const POST_STATUS_VARIANT: Record<
  PostStatus,
  'success' | 'warning' | 'destructive'
> = {
  ACTIVE: 'success',
  HIDDEN: 'warning',
  DELETED: 'destructive',
};

export const BOARD_TYPE_LABEL: Record<BoardType, string> = {
  DAILY: '일상',
  STYLE: '스타일',
  TIP: '팁',
  QUESTION: '질문',
};
