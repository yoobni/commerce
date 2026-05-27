'use client';

import { useActionState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui';
import { login, type LoginState } from '@/lib/auth/actions';

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(login, initialState);

  return (
    <form action={formAction} noValidate className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
          이메일
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          placeholder="admin@example.com"
          className="h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
          비밀번호
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          placeholder="••••••••"
          className="h-11"
        />
      </div>

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="h-11 w-full text-[14px] font-medium" size="lg">
        {isPending ? '로그인 중…' : '로그인'}
      </Button>
    </form>
  );
}
