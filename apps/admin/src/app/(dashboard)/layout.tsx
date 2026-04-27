import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { logout } from '@/lib/auth/actions';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

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
          <span className="text-sm text-[var(--color-text-secondary)]">{session.name}</span>
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
