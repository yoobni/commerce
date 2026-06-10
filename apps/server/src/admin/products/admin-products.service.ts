import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';
import type {
  PaginatedResponse,
  Product,
  ProductStatus,
  Category,
  Size,
  ProductOption,
} from '@commerce/types';

export interface AdminProductRow {
  id: string;
  name_ko: string;
  name_en: string;
  slug: string;
  status: ProductStatus;
  base_price_krw: number;
  thumbnail_url: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category: { id: string; name_ko: string } | null;
}

export interface AdminProductDetail extends Product {
  category: Category | null;
  options: (ProductOption & { size: Size | null })[];
}

export interface ListParams {
  status?: ProductStatus | 'ALL';
  category_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

interface OptionInput {
  id?: string;
  toDelete?: boolean;
  size_id: string;
  color: string;
  color_hex: string | null;
  sku: string;
  additional_price_krw: number;
  additional_price_usd: number;
  additional_price_jpy: number;
  additional_price_eur: number;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
}

interface ProductFieldsInput {
  category_id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  name_de: string;
  description_ko: string;
  description_en: string;
  description_ja: string;
  description_de: string;
  base_price_krw: number;
  base_price_usd: number;
  base_price_jpy: number;
  base_price_eur: number;
  material: string | null;
  care_instruction: string | null;
  weight_g: number | null;
  thumbnail_url: string;
  images: string[];
  status: ProductStatus;
  is_featured: boolean;
}

interface CategoryInput {
  parent_id: string | null;
  slug: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  name_de: string;
  sort_order: number;
  is_active: boolean;
}

@Injectable()
export class AdminProductsService {
  private readonly logger = new Logger(AdminProductsService.name);

  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  // ─── Products ─────────────────────────────────────────────────────────────

  async list(params: ListParams = {}): Promise<PaginatedResponse<AdminProductRow>> {
    const { status = 'ALL', category_id, search, page = 1, per_page = 20 } = params;
    const offset = (page - 1) * per_page;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.supabase.from('products') as any).select(
      'id, name_ko, name_en, slug, status, base_price_krw, thumbnail_url, is_featured, created_at, updated_at, category:categories!category_id(id, name_ko)',
      { count: 'exact' }
    );

    if (status !== 'ALL') query = query.eq('status', status);
    if (category_id) query = query.eq('category_id', category_id);
    if (search) {
      const safe = search.replace(/[%_]/g, (m) => `\\${m}`);
      query = query.or(
        `name_ko.ilike.%${safe}%,name_en.ilike.%${safe}%,slug.ilike.%${safe}%`
      );
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + per_page - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count ?? 0;
    return {
      data: (data ?? []) as AdminProductRow[],
      total,
      page,
      per_page,
      has_next: offset + per_page < total,
    };
  }

  async getById(id: string): Promise<AdminProductDetail | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('products') as any)
      .select('*, category:categories!category_id(*), options:product_options(*, size:sizes(*))')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return data as AdminProductDetail;
  }

  async save(
    productId: string | null,
    input: ProductFieldsInput,
    options: OptionInput[]
  ): Promise<{ id: string }> {
    const now = new Date().toISOString();
    let id = productId;

    if (!productId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.supabase.from('products') as any)
        .insert({
          ...input,
          view_count: 0,
          review_count: 0,
          review_avg_rating: 0,
          published_at: input.status === 'ACTIVE' ? now : null,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();
      if (error) {
        this.logger.error(`[save/create] ${error.message}`);
        throw new BadRequestException('product_create_failed');
      }
      id = (data as { id: string }).id;
    } else {
      const patch: Record<string, unknown> = { ...input, updated_at: now };
      if (input.status === 'ACTIVE') patch.published_at = now;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.supabase.from('products') as any)
        .update(patch)
        .eq('id', productId);
      if (error) {
        this.logger.error(`[save/update] ${error.message}`);
        throw new BadRequestException('product_update_failed');
      }
    }

    const finalId = id!;

    const toDelete = options.filter((o) => o.toDelete && o.id).map((o) => o.id!);
    const toUpsert = options.filter((o) => !o.toDelete);

    if (toDelete.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.supabase.from('product_options') as any)
        .delete()
        .in('id', toDelete);
      if (error) {
        this.logger.error(`[save/option-delete] ${error.message}`);
        throw new BadRequestException('option_delete_failed');
      }
    }

    for (const opt of toUpsert) {
      const row = {
        product_id: finalId,
        size_id: opt.size_id,
        color: opt.color,
        color_hex: opt.color_hex,
        sku: opt.sku,
        additional_price_krw: opt.additional_price_krw,
        additional_price_usd: opt.additional_price_usd,
        additional_price_jpy: opt.additional_price_jpy,
        additional_price_eur: opt.additional_price_eur,
        stock: opt.stock,
        low_stock_threshold: opt.low_stock_threshold,
        is_active: opt.is_active,
        updated_at: now,
      };

      if (opt.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (this.supabase.from('product_options') as any)
          .update(row)
          .eq('id', opt.id);
        if (error) {
          this.logger.error(`[save/option-update] ${error.message}`);
          throw new BadRequestException('option_update_failed');
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (this.supabase.from('product_options') as any).insert({
          ...row,
          created_at: now,
        });
        if (error) {
          this.logger.error(`[save/option-insert] ${error.message}`);
          throw new BadRequestException('option_insert_failed');
        }
      }
    }

    return { id: finalId };
  }

  async updateStatus(id: string, status: ProductStatus): Promise<void> {
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { status, updated_at: now };
    if (status === 'ACTIVE') patch.published_at = now;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('products') as any).update(patch).eq('id', id);
    if (error) {
      this.logger.error(`[updateStatus] ${error.message}`);
      throw new BadRequestException('status_update_failed');
    }
  }

  async delete(id: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('products') as any).delete().eq('id', id);
    if (error) {
      this.logger.error(`[delete] ${error.message}`);
      throw new BadRequestException('product_delete_failed');
    }
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  async listCategories(): Promise<Category[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('categories') as any)
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Category[];
  }

  async saveCategory(id: string | null, input: CategoryInput): Promise<{ id: string }> {
    if (!id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.supabase.from('categories') as any)
        .insert({ ...input, created_at: new Date().toISOString() })
        .select('id')
        .single();
      if (error) {
        this.logger.error(`[saveCategory/create] ${error.message}`);
        throw new BadRequestException('category_create_failed');
      }
      return { id: (data as { id: string }).id };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('categories') as any).update(input).eq('id', id);
    if (error) {
      this.logger.error(`[saveCategory/update] ${error.message}`);
      throw new BadRequestException('category_update_failed');
    }
    return { id };
  }

  async deleteCategory(id: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (this.supabase.from('products') as any)
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);
    if ((count ?? 0) > 0) {
      throw new BadRequestException('category_in_use');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('categories') as any).delete().eq('id', id);
    if (error) {
      this.logger.error(`[deleteCategory] ${error.message}`);
      throw new BadRequestException('category_delete_failed');
    }
  }

  // ─── Sizes ────────────────────────────────────────────────────────────────

  async listSizes(): Promise<Size[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('sizes') as any)
      .select('id, label, sort_order')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Size[];
  }

  async assertProductExists(id: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('products') as any)
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('product_not_found');
  }
}
