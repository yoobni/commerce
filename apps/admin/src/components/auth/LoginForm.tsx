'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '@/lib/auth/actions';

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(login, initialState);

  return (
    <form action={formAction} noValidate>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
          >
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-60 transition"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
          >
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={isPending}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-60 transition"
            placeholder="비밀번호 입력"
          />
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-[var(--color-error)]">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={isPending} className="btn btn-primary w-full py-2.5">
          {isPending ? '로그인 중...' : '로그인'}
        </button>
      </div>
    </form>
  );
}
