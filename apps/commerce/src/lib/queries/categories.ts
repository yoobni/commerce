/**
 * Category queries — Supabase Server Component direct queries.
 * Signatures are identical to lib/api/categories.ts for zero-churn migration.
 */

import type { Category } from '@commerce/types';
import { createClient } from '../supabase/server';

export async function listCategories(activeOnly = true): Promise<Category[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('categories') as any)
    .select('*')
    .order('sort_order', { ascending: true });

  if (activeOnly) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('categories') as any)
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Category;
}

/** Returns root categories (parent_id IS NULL) with their children. */
export async function listCategoriesWithChildren(): Promise<(Category & { children: Category[] })[]> {
  const all = await listCategories(true);
  const roots = all.filter((c) => c.parent_id === null);
  return roots.map((root) => ({
    ...root,
    children: all.filter((c) => c.parent_id === root.id),
  }));
}
