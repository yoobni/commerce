import { Card, CardContent } from '@/components/ui';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--mz-bg-deep)] px-4">
      {/* Brand eyebrow + wordmark */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--mz-accent)]" />
          Management Console
        </span>
        <h1 className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-foreground">
          RAVI Admin
        </h1>
      </div>

      <Card className="w-full max-w-[400px] border-border/80 shadow-[0_1px_2px_rgba(14,14,12,0.04),0_8px_24px_-12px_rgba(14,14,12,0.12)]">
        <CardContent className="px-7 py-8">
          <LoginForm />
        </CardContent>
      </Card>

      {/* Footer meta */}
      <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="font-mono uppercase tracking-wider">
          {process.env.NODE_ENV === 'production' ? 'production' : 'development'}
        </span>
        <span aria-hidden="true">·</span>
        <span>접근 권한이 없으면 SUPER_ADMIN에게 문의하세요.</span>
      </div>
    </main>
  );
}
