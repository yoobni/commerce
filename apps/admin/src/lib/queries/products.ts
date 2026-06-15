/**
 * Admin product / category / size queries. Forwards to @commerce/server via
 * apps/admin/src/lib/api/products.ts. Keeps the original export names so
 * page-level callers don't need to change their imports.
 *
 * UI labels live in lib/admin-ui/products-labels.ts so Client Components can
 * import them without pulling the server-only api chain. This file re-exports
 * them for backward compatibility with server-side callers.
 */

import type { PaginatedResponse } from '@commerce/types';
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

export {
  PRODUCT_STATUS_LABEL,
  PRODUCT_STATUS_VARIANT,
} from '@/lib/admin-ui/products-labels';

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
