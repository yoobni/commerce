import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAddresses } from '@/lib/account/queries';
import { AddressBook } from '../_components/AddressBook';

type Props = { params: Promise<{ locale: string }> };

export default async function AddressesPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login?next=/${locale}/account/addresses`);

  const addresses = await getAddresses(user.id);

  return <AddressBook initialAddresses={addresses} />;
}
