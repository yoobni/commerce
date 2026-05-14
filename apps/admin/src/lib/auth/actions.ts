'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabase/service';
import { signSession, COOKIE_NAME, type AdminRole } from './session';

export interface LoginState {
  error: string | null;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' };
  }

  const supabase = createServiceClient();
  const { data: admin, error: dbError } = await supabase
    .from('admins')
    .select('id, email, name, role, status, password_hash')
    .eq('email', email)
    .single();

  if (dbError || !admin) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  if (admin.status !== 'ACTIVE') {
    return { error: '비활성화된 계정입니다. 관리자에게 문의해주세요.' };
  }

  const passwordMatch = await bcrypt.compare(password, admin.password_hash as string);
  if (!passwordMatch) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  // Update last_login_at (fire-and-forget)
  void supabase
    .from('admins')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', admin.id as string);

  const token = await signSession({
    id: admin.id as string,
    email: admin.email as string,
    name: admin.name as string,
    role: admin.role as AdminRole,
  });

  const headerStore = await headers();
  const ipAddress =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerStore.get('x-real-ip') ??
    'unknown';
  const userAgent = headerStore.get('user-agent') ?? 'unknown';
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

  void supabase.from('admin_sessions').insert({
    admin_id: admin.id as string,
    token_hash: tokenHash,
    ip_address: ipAddress,
    user_agent: userAgent,
    expires_at: expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
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
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const supabase = createServiceClient();
    void supabase
      .from('admin_sessions')
      .update({ is_revoked: true })
      .eq('token_hash', tokenHash);
  }

  cookieStore.delete(COOKIE_NAME);
  redirect('/login');
}
