import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category } from '@commerce/types';
import { SUPABASE_ANON } from '../supabase/supabase.module';

// Public catalog data — SUPABASE_ANON OK.

@Injectable()
export class CategoriesService {
  constructor(@Inject(SUPABASE_ANON) private readonly supabase: SupabaseClient) {}

  async list(activeOnly = true): Promise<Category[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.supabase.from('categories') as any)
      .select('*')
      .order('sort_order', { ascending: true });
    if (activeOnly) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Category[];
  }

  async getBySlug(slug: string): Promise<Category | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('categories') as any)
      .select('*')
      .eq('slug', slug)
      .single();
    if (error || !data) return null;
    return data as Category;
  }

  /** Roots (parent_id IS NULL) with their direct children attached. */
  async listWithChildren(): Promise<(Category & { children: Category[] })[]> {
    const all = await this.list(true);
    const roots = all.filter((c) => c.parent_id === null);
    return roots.map((root) => ({
      ...root,
      children: all.filter((c) => c.parent_id === root.id),
    }));
  }
}
