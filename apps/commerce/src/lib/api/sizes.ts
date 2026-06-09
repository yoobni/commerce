import type { Size } from '@commerce/types';
import { apiGetOne } from './client';

const CATALOG_REVALIDATE = 300;

export async function listSizes(): Promise<Size[]> {
  return apiGetOne<Size[]>('/sizes', { revalidate: CATALOG_REVALIDATE });
}

export async function getSizeById(id: string): Promise<Size | null> {
  try {
    return await apiGetOne<Size>(`/sizes/${encodeURIComponent(id)}`, {
      revalidate: CATALOG_REVALIDATE,
    });
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}
