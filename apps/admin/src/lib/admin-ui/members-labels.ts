// Pure UI labels/variants for the members domain. Safe for client imports.

import type { AuthProvider, UserStatus } from '@commerce/types';

export const MEMBER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: '활성',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

export const AUTH_PROVIDER_LABEL: Record<AuthProvider, string> = {
  email: '이메일',
  google: 'Google',
  apple: 'Apple',
  kakao: '카카오',
  naver: '네이버',
  twitter: 'Twitter/X',
};

export const MEMBER_STATUS_VARIANT: Record<
  UserStatus,
  'success' | 'destructive' | 'muted'
> = {
  ACTIVE: 'success',
  SUSPENDED: 'destructive',
  WITHDRAWN: 'muted',
};

export const AUTH_PROVIDER_VARIANT: Record<
  AuthProvider,
  'outline' | 'secondary' | 'success' | 'warning' | 'info'
> = {
  email: 'outline',
  google: 'info',
  apple: 'secondary',
  kakao: 'warning',
  naver: 'success',
  twitter: 'info',
};
