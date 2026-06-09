import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Size } from '@commerce/types';
import { SUPABASE_ANON } from '../supabase/supabase.module';

@Injectable()
export class SizesService {
  constructor(@Inject(SUPABASE_ANON) private readonly supabase: SupabaseClient) {}

  async list(): Promise<Size[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('sizes') as any)
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Size[];
  }

  async getById(id: string): Promise<Size | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('sizes') as any)
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as Size;
  }
}
