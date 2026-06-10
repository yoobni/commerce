'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { getSession } from '@/lib/auth/session';
import {
  adminSaveProduct,
  adminUpdateProductStatus,
  adminDeleteProduct,
  adminSaveCategory,
  adminDeleteCategory,
  type SaveProductInput,
  type SaveOptionInput,
  type CategoryInput,
} from '@/lib/api/products';
import { ApiCallError } from '@/lib/api/client';
import type { ProductStatus } from '@commerce/types';

// Re-export the input shapes so existing callers (ProductForm, CategoryManager,
// etc.) keep importing types from this module path.
export type { SaveProductInput, SaveOptionInput, CategoryInput };

// ─── Image upload (Storage 그대로 유지) ──────────────────────────────────────
// product-images 버킷 업로드는 BaaS Storage 패턴이라 backend endpoint 로
// 옮기지 않고 admin server-side 에서 service client 로 직접 호출.

export async function uploadProductImage(formData: FormData): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const file = formData.get('file') as File | null;
  if (!file) throw new Error('파일이 없습니다.');

  const supabase = createServiceClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from('products')
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) {
    console.error('[uploadProductImage]', error);
    throw new Error('이미지 업로드 실패');
  }

  const { data } = supabase.storage.from('products').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Error mapping (server error code → 한국어 메시지) ──────────────────────

function mapError(e: unknown, fallback: string): Error {
  if (e instanceof ApiCallError) {
    const map: Record<string, string> = {
      product_create_failed: '상품 등록 실패',
      product_update_failed: '상품 수정 실패',
      product_delete_failed: '상품 삭제 실패',
      option_delete_failed: '옵션 삭제 실패',
      option_update_failed: '옵션 수정 실패',
      option_insert_failed: '옵션 추가 실패',
      status_update_failed: '상태 변경 실패',
      category_create_failed: '카테고리 생성 실패',
      category_update_failed: '카테고리 수정 실패',
      category_delete_failed: '카테고리 삭제 실패',
      category_in_use: '해당 카테고리를 사용 중인 상품이 있어 삭제할 수 없습니다.',
      product_not_found: '상품을 찾을 수 없습니다.',
      unauthorized: '권한이 없습니다.',
      forbidden: '권한이 없습니다.',
    };
    return new Error(map[e.code] ?? fallback);
  }
  return e instanceof Error ? e : new Error(fallback);
}

// ─── Save product (create or update) ─────────────────────────────────────────

export async function saveProduct(
  productId: string | null,
  input: SaveProductInput,
  options: SaveOptionInput[]
): Promise<string> {
  let id: string;
  try {
    id = await adminSaveProduct(productId, input, options);
  } catch (e) {
    throw mapError(e, '상품 저장 실패');
  }
  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  return id;
}

// ─── Update product status (quick action) ────────────────────────────────────

export async function updateProductStatus(
  productId: string,
  status: ProductStatus
): Promise<void> {
  try {
    await adminUpdateProductStatus(productId, status);
  } catch (e) {
    throw mapError(e, '상태 변경 실패');
  }
  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);
}

// ─── Delete product ───────────────────────────────────────────────────────────

export async function deleteProduct(productId: string): Promise<void> {
  try {
    await adminDeleteProduct(productId);
  } catch (e) {
    throw mapError(e, '상품 삭제 실패');
  }
  revalidatePath('/products');
}

// ─── Category CRUD ────────────────────────────────────────────────────────────

export async function saveCategory(
  categoryId: string | null,
  input: CategoryInput
): Promise<string> {
  let id: string;
  try {
    id = await adminSaveCategory(categoryId, input);
  } catch (e) {
    throw mapError(e, '카테고리 저장 실패');
  }
  revalidatePath('/products/categories');
  return id;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await adminDeleteCategory(categoryId);
  } catch (e) {
    throw mapError(e, '카테고리 삭제 실패');
  }
  revalidatePath('/products/categories');
}
