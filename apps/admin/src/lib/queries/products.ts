/**
 * Admin product / category / size queries. Forwards to @commerce/server via
 * apps/admin/src/lib/api/products.ts. Keeps the original export names so
 * page-level callers don't need to change their imports.
 */

import type {
  PaginatedResponse,
  ProductStatus,
} from '@commerce/types';
import {
  adminListProducts as apiListProducts,
  adminGetProduct as apiGetProduct,
  adminListCategories as apiListCategories,
  adminListSizes as apiListSizes,
  type AdminProductRow,
  type AdminProductDetail,
  type AdminListProductsParams,
  type ProductOptionWithSize,
} from '@/lib/api/products';

// ─── UI labels & Badge variants (어드민 페이지 공용) ────────────────────────

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT: '임시저장',
  ACTIVE: '판매중',
  SOLD_OUT: '품절',
  HIDDEN: '숨김',
  DISCONTINUED: '단종',
};

export const PRODUCT_STATUS_VARIANT: Record<
  ProductStatus,
  'success' | 'muted' | 'warning' | 'info' | 'destructive'
> = {
  ACTIVE: 'success',
  DRAFT: 'muted',
  SOLD_OUT: 'warning',
  HIDDEN: 'info',
  DISCONTINUED: 'destructive',
};

// ─── Re-exported types (callers still import from queries/products) ─────────

export type ProductRow = AdminProductRow;
export type ProductDetail = AdminProductDetail;
export type AdminProductListParams = AdminListProductsParams;
export type { ProductOptionWithSize };

// ─── Re-exported queries ────────────────────────────────────────────────────

export async function adminListProducts(
  params: AdminProductListParams = {}
): Promise<PaginatedResponse<ProductRow>> {
  return apiListProducts(params);
}

export async function adminGetProduct(productId: string): Promise<ProductDetail | null> {
  return apiGetProduct(productId);
}

export async function adminListCategories() {
  return apiListCategories();
}

export async function adminListSizes() {
  return apiListSizes();
}
