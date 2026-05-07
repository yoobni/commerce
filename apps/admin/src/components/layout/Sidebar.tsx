'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-config';
import { hasPermission, type AdminRole } from '@/lib/auth/roles';
import { cn } from '@/lib/cn';

interface SidebarProps {
  role: AdminRole;
  onClose?: () => void;
}

export function Sidebar({ role, onClose }: SidebarProps) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.minRole || hasPermission(role, item.minRole)
  );

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="flex flex-col h-full"
      style={{ background: 'var(--color-sidebar)' }}
      aria-label="사이드바 내비게이션"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-5 border-b border-white/10 shrink-0">
        <span className="text-white font-bold text-base tracking-wide">RAVI Admin</span>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="사이드바 닫기"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1" role="list">
          {visibleItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'text-white'
                      : 'text-[var(--color-sidebar-text)] hover:text-white hover:bg-white/10'
                  )}
                  style={active ? { background: 'var(--color-sidebar-active)' } : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 shrink-0"
                    aria-hidden="true"
                  >
                    <path d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
