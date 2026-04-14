import type { Category } from '@commerce/types';
import { getCategories } from './mock/loader';

export async function listCategories(activeOnly = true): Promise<Category[]> {
  const all = await getCategories();
  return activeOnly ? all.filter((c) => c.is_active) : all;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}
