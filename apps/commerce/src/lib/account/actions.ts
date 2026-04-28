'use server';

import { createClient } from '@/lib/supabase/server';
import type { Country } from '@commerce/types';

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface UpdateProfileInput {
  name: string;
  phone: string | null;
  marketing_agreed: boolean;
}

export async function updateProfileAction(
  input: UpdateProfileInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update({
      name: input.name,
      phone: input.phone,
      marketing_agreed: input.marketing_agreed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { success: false, error: (error as { message?: string }).message };
  return { success: true };
}

// ─── Addresses ────────────────────────────────────────────────────────────────

export interface AddressInput {
  label: string | null;
  recipient_name: string;
  phone: string;
  country: Country;
  postal_code: string;
  state_province: string | null;
  city: string;
  address_line1: string;
  address_line2: string | null;
  is_default: boolean;
}

export async function createAddressAction(
  input: AddressInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  if (input.is_default) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('addresses') as any).update({ is_default: false }).eq('user_id', user.id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('addresses') as any).insert({
    ...input,
    user_id: user.id,
  });

  if (error) return { success: false, error: (error as { message?: string }).message };
  return { success: true };
}

export async function updateAddressAction(
  addressId: string,
  input: AddressInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  if (input.is_default) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('addresses') as any).update({ is_default: false }).eq('user_id', user.id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('addresses') as any)
    .update(input)
    .eq('id', addressId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: (error as { message?: string }).message };
  return { success: true };
}

export async function deleteAddressAction(
  addressId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('addresses') as any)
    .delete()
    .eq('id', addressId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: (error as { message?: string }).message };
  return { success: true };
}

export async function setDefaultAddressAction(
  addressId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('addresses') as any).update({ is_default: false }).eq('user_id', user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('addresses') as any)
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: (error as { message?: string }).message };
  return { success: true };
}

// ─── Account Withdrawal ───────────────────────────────────────────────────────

export async function withdrawAccountAction(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update({
      status: 'WITHDRAWN',
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { success: false, error: (error as { message?: string }).message };
  return { success: true };
}
