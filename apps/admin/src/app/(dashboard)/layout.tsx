import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui';

/**
 * 어드민 대시보드 레이아웃 — 데스크톱 전용 구조.
 * 사이드바는 240px 고정, 메인은 같은 만큼 left 마진.
 * 모바일 대응(햄버거/시트)은 별도 작업.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-20 w-60">
        <Sidebar role={session.role} name={session.name} email={session.email} />
      </div>

      <div className="flex min-h-screen flex-col pl-60">
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
