import type { Category } from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

export async function adminListCategories(): Promise<Category[]> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('categories') as any)
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Category[];
}
