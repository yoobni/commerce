import type { Category } from '@commerce/types';
import { apiGetOne } from './client';

const CATALOG_REVALIDATE = 300;

export async function listCategories(activeOnly = true): Promise<Category[]> {
  // Server returns categories as a plain array — wrap it with apiGetOne since
  // it's a "single resource" view (the list itself), not a paginated list.
  const sp = new URLSearchParams();
  sp.set('active_only', String(activeOnly));
  return apiGetOne<Category[]>(`/categories?${sp.toString()}`, {
    revalidate: CATALOG_REVALIDATE,
  });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    return await apiGetOne<Category>(
      `/categories/${encodeURIComponent(slug)}`,
      { revalidate: CATALOG_REVALIDATE }
    );
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function listCategoriesWithChildren(): Promise<
  (Category & { children: Category[] })[]
> {
  return apiGetOne<(Category & { children: Category[] })[]>(
    `/categories?shape=tree`,
    { revalidate: CATALOG_REVALIDATE }
  );
}
