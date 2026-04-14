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

export interface CategoryTree {
  parent: Category;
  children: Category[];
}

export async function adminGetCategoryTree(): Promise<CategoryTree[]> {
  const all = await adminListCategories();
  const parents = all.filter((c) => c.parent_id === null);
  return parents.map((parent) => ({
    parent,
    children: all.filter((c) => c.parent_id === parent.id),
  }));
}

export async function adminGetCategory(id: string): Promise<Category | null> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('categories') as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Category;
}
