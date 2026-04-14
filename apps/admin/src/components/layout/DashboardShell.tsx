'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardShellProps {
  children: React.ReactNode;
  adminName?: string;
  adminEmail?: string;
}

export function DashboardShell({ children, adminName, adminEmail }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleClose = useCallback(() => setSidebarOpen(false), []);
  const handleToggle = useCallback(() => setSidebarOpen((v) => !v), []);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — always visible */}
      <aside
        className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-20"
        style={{ width: 'var(--sidebar-width)' }}
      >
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          aria-hidden="true"
          onClick={handleClose}
          style={{ background: 'rgba(0,0,0,0.5)' }}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col lg:hidden transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ width: 'var(--sidebar-width)' }}
        aria-label="모바일 내비게이션"
      >
        <Sidebar onClose={handleClose} />
      </aside>

      {/* Main area — lg:ml-60 matches --sidebar-width: 240px */}
      <div className="flex flex-col flex-1 lg:ml-60">

        <Header onMenuToggle={handleToggle} adminName={adminName} adminEmail={adminEmail} />

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
