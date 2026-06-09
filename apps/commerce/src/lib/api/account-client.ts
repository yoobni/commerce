'use client';

import type { Country } from '@commerce/types';
import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import { apiDelete, apiPatch, apiPost } from './client';

async function browserToken(): Promise<string | undefined> {
  const supabase = createBrowserSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

// ── Profile ──────────────────────────────────────────────────────────────

export interface UpdateProfileInput {
  name: string;
  phone: string | null;
  marketing_agreed: boolean;
}

export async function updateProfile(input: UpdateProfileInput): Promise<void> {
  await apiPatch<{ id: string }>('/account/me', {
    accessToken: await browserToken(),
    body: input,
  });
}

export async function withdrawAccount(): Promise<void> {
  await apiPost<{ id: string }>('/account/me/withdraw', {
    accessToken: await browserToken(),
  });
}

// ── Addresses ────────────────────────────────────────────────────────────

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

export async function createAddress(input: AddressInput): Promise<{ id: string }> {
  return apiPost('/account/me/addresses', {
    accessToken: await browserToken(),
    body: input,
  });
}

export async function updateAddress(addressId: string, input: AddressInput): Promise<void> {
  await apiPatch<{ id: string }>(
    `/account/me/addresses/${encodeURIComponent(addressId)}`,
    { accessToken: await browserToken(), body: input }
  );
}

export async function deleteAddress(addressId: string): Promise<void> {
  await apiDelete(`/account/me/addresses/${encodeURIComponent(addressId)}`, {
    accessToken: await browserToken(),
  });
}

export async function setDefaultAddress(addressId: string): Promise<void> {
  await apiPost(`/account/me/addresses/${encodeURIComponent(addressId)}/default`, {
    accessToken: await browserToken(),
  });
}
