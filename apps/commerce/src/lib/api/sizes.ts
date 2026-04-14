import type { Size } from '@commerce/types';
import { getSizes } from './mock/loader';

export async function listSizes(): Promise<Size[]> {
  const all = await getSizes();
  return [...all].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getSizeById(id: string): Promise<Size | null> {
  const all = await getSizes();
  return all.find((s) => s.id === id) ?? null;
}
