// Dashboard shell — sidebar + header layout
// Auth guard to be added once Supabase Auth is wired up

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-20 flex flex-col"
        style={{ width: 'var(--sidebar-width)', background: 'var(--color-sidebar)' }}
        aria-label="사이드바 내비게이션"
      >
        <div className="flex items-center h-14 px-5 border-b border-white/10">
          <span className="text-white font-bold text-base tracking-wide">RAVI Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* Nav items — to be componentised */}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width)' }}>
        <header
          className="sticky top-0 z-10 flex items-center px-6 bg-white border-b border-[var(--color-border)]"
          style={{ height: 'var(--header-height)' }}
        >
          {/* Header actions — user menu, notifications */}
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
