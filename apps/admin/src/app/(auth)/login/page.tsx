export const metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">RAVI Admin</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">관리자 로그인</p>
        </div>
        {/* Auth form — to be implemented with Supabase Auth */}
        <p className="text-center text-sm text-[var(--color-text-tertiary)]">
          준비 중입니다
        </p>
      </div>
    </main>
  );
}
