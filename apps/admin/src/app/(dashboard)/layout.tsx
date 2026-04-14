import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <DashboardShell adminName={session.name} adminEmail={session.email}>
      {children}
    </DashboardShell>
  );
}
