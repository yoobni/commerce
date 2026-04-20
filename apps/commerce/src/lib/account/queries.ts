import { createClient } from '@/lib/supabase/server';
import type { User, Address } from '@commerce/types';

export async function getUserProfile(userId: string): Promise<User | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('users') as any)
    .select('*')
    .eq('id', userId)
    .single();
  return (data as User) ?? null;
}

export async function getAddresses(userId: string): Promise<Address[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('addresses') as any)
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  return (data as Address[]) ?? [];
}
