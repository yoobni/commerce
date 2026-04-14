/**
 * Size queries — Supabase Server Component direct queries.
 * Signatures are identical to lib/api/sizes.ts for zero-churn migration.
 */

import type { Size } from '@commerce/types';
import { createClient } from '../supabase/server';

export async function listSizes(): Promise<Size[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('sizes') as any)
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Size[];
}

export async function getSizeById(id: string): Promise<Size | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('sizes') as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Size;
}
