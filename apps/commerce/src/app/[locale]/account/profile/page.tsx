import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/account/queries';
import { ProfileForm } from '../_components/ProfileForm';

type Props = { params: Promise<{ locale: string }> };

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login?next=/${locale}/account/profile`);

  const profile = await getUserProfile(user.id);

  return <ProfileForm authUser={user} profile={profile} />;
}
