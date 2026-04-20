import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SecuritySection } from '../_components/SecuritySection';

type Props = { params: Promise<{ locale: string }> };

export default async function SecurityPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login?next=/${locale}/account/security`);

  return <SecuritySection authUser={user} />;
}
