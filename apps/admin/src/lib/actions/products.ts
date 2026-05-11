'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { requireRole } from '@/lib/auth/guard';
import type { ProductStatus } from '@commerce/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SaveOptionInput {
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

export interface SaveProductInput {
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

export interface CategoryInput {
  parent_id: string | null;
  slug: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  name_de: string;
  sort_order: number;
  is_active: boolean;
}

// ─── Image upload ─────────────────────────────────────────────────────────────
// Requires a public Supabase Storage bucket named "product-images".

export async function uploadProductImage(formData: FormData): Promise<string> {
  await requireRole('OPERATOR');

  const file = formData.get('file') as File | null;
  if (!file) throw new Error('파일이 없습니다.');

  const supabase = createServiceClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from('products')
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

  const { data } = supabase.storage.from('products').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Save product (create or update) ─────────────────────────────────────────

export async function saveProduct(
  productId: string | null,
  input: SaveProductInput,
  options: SaveOptionInput[]
): Promise<string> {
  await requireRole('OPERATOR');

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  let id = productId;

  if (!productId) {
    // Create
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('products') as any)
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

    if (error) throw new Error(`상품 등록 실패: ${error.message}`);
    id = data.id as string;
  } else {
    // Update
    const patch: Record<string, unknown> = { ...input, updated_at: now };
    if (input.status === 'ACTIVE') patch.published_at = now;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('products') as any).update(patch).eq('id', productId);

    if (error) throw new Error(`상품 수정 실패: ${error.message}`);
  }

  const finalId = id!;

  // Batch options
  const toDelete = options.filter((o) => o.toDelete && o.id).map((o) => o.id!);
  const toUpsert = options.filter((o) => !o.toDelete);

  if (toDelete.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('product_options') as any).delete().in('id', toDelete);
    if (error) throw new Error(`옵션 삭제 실패: ${error.message}`);
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
      const { error } = await (supabase.from('product_options') as any)
        .update(row)
        .eq('id', opt.id);
      if (error) throw new Error(`옵션 수정 실패: ${error.message}`);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('product_options') as any).insert({
        ...row,
        created_at: now,
      });
      if (error) throw new Error(`옵션 추가 실패: ${error.message}`);
    }
  }

  revalidatePath('/products');
  revalidatePath(`/products/${finalId}`);
  return finalId;
}

// ─── Update product status (quick action) ────────────────────────────────────

export async function updateProductStatus(productId: string, status: ProductStatus): Promise<void> {
  await requireRole('OPERATOR');

  const supabase = createServiceClient();
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status, updated_at: now };
  if (status === 'ACTIVE') patch.published_at = now;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any).update(patch).eq('id', productId);

  if (error) throw new Error(`상태 변경 실패: ${error.message}`);

  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);
}

// ─── Category CRUD ────────────────────────────────────────────────────────────

export async function saveCategory(
  categoryId: string | null,
  input: CategoryInput
): Promise<string> {
  await requireRole('OPERATOR');

  const supabase = createServiceClient();

  if (!categoryId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('categories') as any)
      .insert({ ...input, created_at: new Date().toISOString() })
      .select('id')
      .single();
    if (error) throw new Error(`카테고리 생성 실패: ${error.message}`);
    revalidatePath('/products/categories');
    return data.id as string;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('categories') as any).update(input).eq('id', categoryId);
    if (error) throw new Error(`카테고리 수정 실패: ${error.message}`);
    revalidatePath('/products/categories');
    return categoryId;
  }
}

// ─── Delete product ───────────────────────────────────────────────────────────

export async function deleteProduct(productId: string): Promise<void> {
  await requireRole('SUPER_ADMIN');

  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any).delete().eq('id', productId);

  if (error) throw new Error(`상품 삭제 실패: ${error.message}`);

  revalidatePath('/products');
}

// ─── Category CRUD ────────────────────────────────────────────────────────────

export async function deleteCategory(categoryId: string): Promise<void> {
  await requireRole('SUPER_ADMIN');

  const supabase = createServiceClient();

  // Guard: check products using this category
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase.from('products') as any)
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if ((count ?? 0) > 0) {
    throw new Error('해당 카테고리를 사용 중인 상품이 있어 삭제할 수 없습니다.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('categories') as any).delete().eq('id', categoryId);

  if (error) throw new Error(`카테고리 삭제 실패: ${error.message}`);
  revalidatePath('/products/categories');
}
