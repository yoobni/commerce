import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center space-y-4">
        <p className="text-5xl font-bold" style={{ color: 'var(--color-primary)' }}>403</p>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">접근 권한이 없습니다</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          이 페이지는 슈퍼어드민만 접근할 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-block mt-2 text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
