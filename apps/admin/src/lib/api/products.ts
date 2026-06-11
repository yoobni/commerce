// Admin products / categories / sizes API client. Server-side only — every
// call forwards the admin cookie token as Bearer auth.

import type {
  Category,
  PaginatedResponse,
  Product,
  ProductOption,
  ProductStatus,
  Size,
} from '@commerce/types';
import { apiGetList, apiGetOne, apiPost, apiPatch, apiDelete } from './client';
import { getAdminToken } from './auth';

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

export interface ProductOptionWithSize extends Omit<ProductOption, 'size'> {
  size: Size | null;
}

export interface AdminProductDetail extends Product {
  category: Category | null;
  options: ProductOptionWithSize[];
}

export interface AdminListProductsParams {
  status?: ProductStatus | 'ALL';
  category_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

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
  material_ko: string | null;
  material_en: string | null;
  material_ja: string | null;
  material_de: string | null;
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

function buildListQuery(params: AdminListProductsParams): string {
  const sp = new URLSearchParams();
  if (params.status && params.status !== 'ALL') sp.set('status', params.status);
  if (params.category_id) sp.set('category_id', params.category_id);
  if (params.search) sp.set('search', params.search);
  if (params.page) sp.set('page', String(params.page));
  if (params.per_page) sp.set('per_page', String(params.per_page));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

async function authed() {
  const accessToken = await getAdminToken();
  return { accessToken, noStore: true } as const;
}

// ─── Products ───────────────────────────────────────────────────────────────

export async function adminListProducts(
  params: AdminListProductsParams = {}
): Promise<PaginatedResponse<AdminProductRow>> {
  const { data, meta } = await apiGetList<AdminProductRow>(
    `/admin/products${buildListQuery(params)}`,
    await authed()
  );
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function adminGetProduct(id: string): Promise<AdminProductDetail | null> {
  try {
    return await apiGetOne<AdminProductDetail>(`/admin/products/${id}`, await authed());
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function adminSaveProduct(
  productId: string | null,
  product: SaveProductInput,
  options: SaveOptionInput[]
): Promise<string> {
  const opts = { ...(await authed()), body: { product, options } };
  if (productId) {
    const res = await apiPatch<{ id: string }>(`/admin/products/${productId}`, opts);
    return res.id;
  }
  const res = await apiPost<{ id: string }>('/admin/products', opts);
  return res.id;
}

export async function adminUpdateProductStatus(
  productId: string,
  status: ProductStatus
): Promise<void> {
  await apiPatch(`/admin/products/${productId}/status`, {
    ...(await authed()),
    body: { status },
  });
}

export async function adminDeleteProduct(productId: string): Promise<void> {
  await apiDelete(`/admin/products/${productId}`, await authed());
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function adminListCategories(): Promise<Category[]> {
  return apiGetOne<Category[]>('/admin/categories', await authed());
}

export async function adminSaveCategory(
  categoryId: string | null,
  input: CategoryInput
): Promise<string> {
  const opts = { ...(await authed()), body: input };
  if (categoryId) {
    const res = await apiPatch<{ id: string }>(`/admin/categories/${categoryId}`, opts);
    return res.id;
  }
  const res = await apiPost<{ id: string }>('/admin/categories', opts);
  return res.id;
}

export async function adminDeleteCategory(categoryId: string): Promise<void> {
  await apiDelete(`/admin/categories/${categoryId}`, await authed());
}

// ─── Sizes ──────────────────────────────────────────────────────────────────

export async function adminListSizes(): Promise<Size[]> {
  return apiGetOne<Size[]>('/admin/sizes', await authed());
}
