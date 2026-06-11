'use client';

// Client-side hound profile API. Forwards the browser session token as Bearer
// auth (same pattern as wishlist-client). Used by the onboarding flow.

import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import { apiGetOne, apiPost } from './client';

export type HoundBodyType = 'Sporty' | 'Sturdy' | 'Slim' | 'Cloud';
export type HoundSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface HoundProfile {
  name: string;
  breed?: string | null;
  body_type: HoundBodyType;
  weight_kg: number;
  size: HoundSize;
  avatar_url?: string | null;
}

async function browserToken(): Promise<string | undefined> {
  try {
    const supabase = createBrowserSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  } catch {
    return undefined;
  }
}

export async function getHoundProfile(): Promise<HoundProfile | null> {
  const accessToken = await browserToken();
  if (!accessToken) return null;
  try {
    return await apiGetOne<HoundProfile | null>('/account/me/hound-profile', {
      accessToken,
      noStore: true,
    });
  } catch {
    return null;
  }
}

export async function saveHoundProfile(profile: HoundProfile): Promise<HoundProfile> {
  const accessToken = await browserToken();
  if (!accessToken) throw new Error('unauthorized');
  return apiPost<HoundProfile>('/account/me/hound-profile', {
    accessToken,
    body: profile,
  });
}
