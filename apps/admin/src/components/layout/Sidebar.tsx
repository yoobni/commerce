'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsUpDown, LogOut, X } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui';
import { NAV_ITEMS } from './nav-config';
import { hasPermission, type AdminRole } from '@/lib/auth/roles';
import { cn } from '@/lib/cn';
import { logout } from '@/lib/auth/actions';

interface SidebarProps {
  role: AdminRole;
  name: string;
  email: string;
  onClose?: () => void;
}

export function Sidebar({ role, name, email, onClose }: SidebarProps) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.minRole || hasPermission(role, item.minRole),
  );

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      className="flex h-full w-full flex-col bg-[var(--mz-ink)] text-white"
      aria-label="사이드바 내비게이션"
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <span className="text-[15px] font-semibold tracking-wide">RAVI Admin</span>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="사이드바 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5" role="list">
          {visibleItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[var(--mz-accent)] text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User menu */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
              'hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[var(--mz-accent)] text-[12px] font-semibold text-white">
                {initials || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-white">{name}</div>
              <div className="truncate text-[11px] text-white/55">{email}</div>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-white/55" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-[220px]">
            <DropdownMenuLabel className="font-normal">
              <div className="text-[12.5px] font-medium text-foreground">{name}</div>
              <div className="text-[11px] text-muted-foreground">{email}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--mz-accent)]">
                {role}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={logout}>
              <DropdownMenuItem asChild>
                <button type="submit" className="flex w-full cursor-default items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
