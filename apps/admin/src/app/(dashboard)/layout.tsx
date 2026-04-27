import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { logout } from '@/lib/auth/actions';
import { Sidebar } from '@/components/layout/Sidebar';

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: '슈퍼어드민',
  OPERATOR: '운영자',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const roleLabel = ROLE_LABEL[session.role] ?? session.role;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-20 flex flex-col"
        style={{ width: 'var(--sidebar-width)' }}
      >
        <Sidebar role={session.role} />
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width)' }}>
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-6 bg-white border-b border-[var(--color-border)]"
          style={{ height: 'var(--header-height)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{session.name}</span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={
                session.role === 'SUPER_ADMIN'
                  ? { background: '#fef3c7', color: '#92400e' }
                  : { background: '#e0e7ff', color: '#3730a3' }
              }
            >
              {roleLabel}
            </span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              로그아웃
            </button>
          </form>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
