'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { ProductStatus, ProductOption } from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OptionInput {
  id: string | null;
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
  _delete: boolean;
}

export interface ProductInput {
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
  weight_g: number | null;
  material: string | null;
  care_instruction: string | null;
  thumbnail_url: string;
  images: string[];
  status: ProductStatus;
  is_featured: boolean;
  options: OptionInput[];
}

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getRequestMeta(): Promise<{ ip: string; ua: string }> {
  const h = await headers();
  const ip = h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'unknown';
  const ua = h.get('user-agent') ?? 'unknown';
  return { ip, ua };
}

async function writeAuditLog(params: {
  adminId: string;
  action: string;
  targetId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip: string;
  ua: string;
}): Promise<void> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('audit_logs') as any).insert({
    admin_id: params.adminId,
    action: params.action,
    target_type: 'product',
    target_id: params.targetId,
    before_value: params.before,
    after_value: params.after,
    ip_address: params.ip,
    user_agent: params.ua,
    memo: null,
  });
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

/** Upload a single image to the products bucket. Returns the public URL. */
export async function uploadProductImage(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: '파일이 없습니다.' };
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE) {
    return { error: '파일 크기는 10MB 이하여야 합니다.' };
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowed.includes(file.type)) {
    return { error: '지원하지 않는 이미지 형식입니다. (jpg/png/webp/avif)' };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;

  const buffer = await file.arrayBuffer();
  const supabase = createServiceClient();

  const { error } = await supabase.storage
    .from('products')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return { error: `업로드 실패: ${error.message}` };

  const { data } = supabase.storage.from('products').getPublicUrl(path);
  return { url: data.publicUrl };
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProduct(
  adminId: string,
  input: ProductInput
): Promise<ActionResult> {
  const supabase = createServiceClient();
  const { ip, ua } = await getRequestMeta();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: product, error: insertError } = await (supabase.from('products') as any)
    .insert({
      category_id: input.category_id,
      slug: input.slug,
      name_ko: input.name_ko,
      name_en: input.name_en,
      name_ja: input.name_ja,
      name_de: input.name_de,
      description_ko: input.description_ko,
      description_en: input.description_en,
      description_ja: input.description_ja,
      description_de: input.description_de,
      base_price_krw: input.base_price_krw,
      base_price_usd: input.base_price_usd,
      base_price_jpy: input.base_price_jpy,
      base_price_eur: input.base_price_eur,
      weight_g: input.weight_g,
      material: input.material,
      care_instruction: input.care_instruction,
      thumbnail_url: input.thumbnail_url,
      images: input.images,
      status: input.status,
      is_featured: input.is_featured,
      published_at: input.status === 'ACTIVE' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (insertError || !product) {
    return { ok: false, error: insertError?.message ?? '상품 생성에 실패했습니다.' };
  }

  const productId = (product as { id: string }).id;

  // Insert options
  const newOptions = input.options.filter((o) => !o._delete && o.size_id && o.sku);
  if (newOptions.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: optError } = await (supabase.from('product_options') as any).insert(
      newOptions.map((o) => ({
        product_id: productId,
        size_id: o.size_id,
        color: o.color,
        color_hex: o.color_hex || null,
        sku: o.sku,
        additional_price_krw: o.additional_price_krw,
        additional_price_usd: o.additional_price_usd,
        additional_price_jpy: o.additional_price_jpy,
        additional_price_eur: o.additional_price_eur,
        stock: o.stock,
        low_stock_threshold: o.low_stock_threshold,
        is_active: o.is_active,
      }))
    );
    if (optError) {
      // Rollback: delete the product
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('products') as any).delete().eq('id', productId);
      return { ok: false, error: `옵션 생성 실패: ${optError.message}` };
    }
  }

  await writeAuditLog({
    adminId,
    action: 'CREATE_PRODUCT',
    targetId: productId,
    before: null,
    after: { ...input, options: newOptions },
    ip,
    ua,
  });

  revalidatePath('/products');
  return { ok: true, id: productId };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProduct(
  id: string,
  adminId: string,
  input: ProductInput
): Promise<ActionResult> {
  const supabase = createServiceClient();
  const { ip, ua } = await getRequestMeta();

  // Fetch current state for audit log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: before } = await (supabase.from('products') as any)
    .select('*')
    .eq('id', id)
    .single();

  // Determine published_at: set if transitioning to ACTIVE and not already set
  let publishedAt: string | null | undefined = undefined;
  if (input.status === 'ACTIVE' && before && !(before as { published_at: string | null }).published_at) {
    publishedAt = new Date().toISOString();
  }

  const updatePayload: Record<string, unknown> = {
    category_id: input.category_id,
    slug: input.slug,
    name_ko: input.name_ko,
    name_en: input.name_en,
    name_ja: input.name_ja,
    name_de: input.name_de,
    description_ko: input.description_ko,
    description_en: input.description_en,
    description_ja: input.description_ja,
    description_de: input.description_de,
    base_price_krw: input.base_price_krw,
    base_price_usd: input.base_price_usd,
    base_price_jpy: input.base_price_jpy,
    base_price_eur: input.base_price_eur,
    weight_g: input.weight_g,
    material: input.material,
    care_instruction: input.care_instruction,
    thumbnail_url: input.thumbnail_url,
    images: input.images,
    status: input.status,
    is_featured: input.is_featured,
  };
  if (publishedAt !== undefined) updatePayload['published_at'] = publishedAt;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase.from('products') as any)
    .update(updatePayload)
    .eq('id', id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  // Handle options: delete marked, update existing, insert new
  const toDelete = input.options.filter((o) => o._delete && o.id);
  const toUpdate = input.options.filter((o) => !o._delete && o.id);
  const toInsert = input.options.filter((o) => !o._delete && !o.id && o.size_id && o.sku);

  if (toDelete.length > 0) {
    const deleteIds = toDelete.map((o) => o.id as string);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('product_options') as any)
      .delete()
      .in('id', deleteIds);
    if (error) return { ok: false, error: `옵션 삭제 실패: ${error.message}` };
  }

  for (const o of toUpdate) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('product_options') as any)
      .update({
        size_id: o.size_id,
        color: o.color,
        color_hex: o.color_hex || null,
        sku: o.sku,
        additional_price_krw: o.additional_price_krw,
        additional_price_usd: o.additional_price_usd,
        additional_price_jpy: o.additional_price_jpy,
        additional_price_eur: o.additional_price_eur,
        stock: o.stock,
        low_stock_threshold: o.low_stock_threshold,
        is_active: o.is_active,
      })
      .eq('id', o.id as string);
    if (error) return { ok: false, error: `옵션 수정 실패: ${error.message}` };
  }

  if (toInsert.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('product_options') as any).insert(
      toInsert.map((o) => ({
        product_id: id,
        size_id: o.size_id,
        color: o.color,
        color_hex: o.color_hex || null,
        sku: o.sku,
        additional_price_krw: o.additional_price_krw,
        additional_price_usd: o.additional_price_usd,
        additional_price_jpy: o.additional_price_jpy,
        additional_price_eur: o.additional_price_eur,
        stock: o.stock,
        low_stock_threshold: o.low_stock_threshold,
        is_active: o.is_active,
      }))
    );
    if (error) return { ok: false, error: `옵션 추가 실패: ${error.message}` };
  }

  await writeAuditLog({
    adminId,
    action: 'UPDATE_PRODUCT',
    targetId: id,
    before: before as Record<string, unknown> | null,
    after: { ...updatePayload, options: input.options },
    ip,
    ua,
  });

  revalidatePath('/products');
  revalidatePath(`/products/${id}/edit`);
  return { ok: true, id };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProduct(
  id: string,
  adminId: string
): Promise<ActionResult> {
  const supabase = createServiceClient();
  const { ip, ua } = await getRequestMeta();

  // Fetch option IDs for this product
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: optionRows } = await (supabase.from('product_options') as any)
    .select('id')
    .eq('product_id', id);

  const optionIds = ((optionRows ?? []) as { id: string }[]).map((r) => r.id);

  // Check for active orders referencing these options
  if (optionIds.length > 0) {
    const TERMINAL_ORDER_STATUSES = [
      'CANCELLED',
      'REFUNDED',
      'RETURNED',
      'DELIVERY_FAILED',
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: activeItems, error: checkError } = await (supabase.from('order_items') as any)
      .select('id, orders!inner(status)')
      .in('product_option_id', optionIds)
      .not('orders.status', 'in', `(${TERMINAL_ORDER_STATUSES.join(',')})`);

    if (checkError) return { ok: false, error: '주문 확인 중 오류가 발생했습니다.' };

    if (activeItems && (activeItems as unknown[]).length > 0) {
      return {
        ok: false,
        error: '진행 중인 주문이 있는 상품은 삭제할 수 없습니다. 상태를 DISCONTINUED로 변경해주세요.',
      };
    }
  }

  // Fetch before value for audit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: before } = await (supabase.from('products') as any)
    .select('*')
    .eq('id', id)
    .single();

  // Delete (cascades to product_options)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any).delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  await writeAuditLog({
    adminId,
    action: 'DELETE_PRODUCT',
    targetId: id,
    before: before as Record<string, unknown> | null,
    after: null,
    ip,
    ua,
  });

  revalidatePath('/products');
  return { ok: true, id };
}

// ─── Duplicate check for slug ─────────────────────────────────────────────────

export async function checkSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('products') as any).select('id').eq('slug', slug);
  if (excludeId) query = query.neq('id', excludeId);

  const { data } = await query;
  return !data || (data as unknown[]).length === 0;
}

// ─── Stock adjustment ─────────────────────────────────────────────────────────

export async function adjustOptionStock(
  optionId: string,
  adminId: string,
  delta: number,
  memo: string
): Promise<ActionResult> {
  const supabase = createServiceClient();
  const { ip, ua } = await getRequestMeta();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current, error: fetchErr } = await (supabase.from('product_options') as any)
    .select('id, stock, product_id')
    .eq('id', optionId)
    .single();

  if (fetchErr || !current) return { ok: false, error: '옵션을 찾을 수 없습니다.' };

  const opt = current as { id: string; stock: number; product_id: string };
  const newStock = opt.stock + delta;
  if (newStock < 0) return { ok: false, error: '재고가 부족합니다.' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (supabase.from('product_options') as any)
    .update({ stock: newStock })
    .eq('id', optionId);

  if (updateErr) return { ok: false, error: updateErr.message };

  await writeAuditLog({
    adminId,
    action: 'ADJUST_STOCK',
    targetId: opt.product_id,
    before: { option_id: optionId, stock: opt.stock },
    after: { option_id: optionId, stock: newStock, delta, memo },
    ip,
    ua,
  });

  return { ok: true, id: optionId };
}

// ─── Get options for a product (used for stock table in list) ─────────────────

export async function getProductOptions(productId: string): Promise<ProductOption[]> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('product_options') as any)
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data ?? []) as ProductOption[];
}
