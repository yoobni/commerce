'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME } from './session';
import { postLogin, postLogout } from '@/lib/api/auth';
import { ApiCallError } from '@/lib/api/client';

export interface LoginState {
  error: string | null;
}

// Forwards credentials to @commerce/server which owns the bcrypt compare +
// admin_sessions bookkeeping. This action only handles:
//   1. UI-level validation (non-empty inputs)
//   2. Mapping server error codes → 한국어 메시지
//   3. Setting/clearing the httpOnly admin cookie

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' };
  }

  let result;
  try {
    result = await postLogin(email, password);
  } catch (e) {
    if (e instanceof ApiCallError) {
      if (e.code === 'invalid_credentials') {
        return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
      }
      if (e.code === 'account_inactive') {
        return { error: '비활성화된 계정입니다. 관리자에게 문의해주세요.' };
      }
    }
    return { error: '로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });

  redirect('/');
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await postLogout(token);
  }

  cookieStore.delete(COOKIE_NAME);
  redirect('/login');
}
