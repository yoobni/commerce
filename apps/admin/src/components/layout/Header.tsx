'use client';

import { logout } from '@/lib/auth/actions';

interface HeaderProps {
  onMenuToggle: () => void;
  adminName?: string;
  adminEmail?: string;
}

export function Header({ onMenuToggle, adminName = '관리자', adminEmail }: HeaderProps) {
  const initials = adminName.slice(0, 2).toUpperCase();

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 bg-white border-b border-[var(--color-border)]"
      style={{ height: 'var(--header-height)' }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] transition-colors"
        aria-label="메뉴 열기"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Spacer on desktop */}
      <div className="hidden lg:block" />

      {/* Right: admin info + logout */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-[var(--color-text-primary)] leading-tight">{adminName}</span>
          {adminEmail && (
            <span className="text-xs text-[var(--color-text-tertiary)] leading-tight">{adminEmail}</span>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
          style={{ background: 'var(--color-sidebar-active)' }}
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:bg-red-50 rounded-md transition-colors"
            aria-label="로그아웃"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </form>
      </div>
    </header>
  );
}
