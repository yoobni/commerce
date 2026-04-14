/**
 * Product API — JSON mock implementation.
 * Interface mirrors what a real Supabase implementation will expose.
 * Swap out the internals when DB is ready; callers stay unchanged.
 */

import type { Product, ProductWithDetails, PaginatedResponse } from '@commerce/types';
import {
  getProducts,
  getProductOptions,
  getCategories,
  getSizes,
} from './mock/loader';

export interface ProductListParams {
  category_slug?: string;
  status?: Product['status'];
  featured?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  per_page?: number;
}

export async function listProducts(
  params: ProductListParams = {}
): Promise<PaginatedResponse<Product>> {
  const { category_slug, status = 'ACTIVE', featured, sort = 'newest', page = 1, per_page = 20 } = params;

  const [allProducts, categories] = await Promise.all([getProducts(), getCategories()]);

  let filtered = allProducts.filter((p) => p.status === status);

  if (category_slug) {
    const cat = categories.find((c) => c.slug === category_slug);
    if (cat) filtered = filtered.filter((p) => p.category_id === cat.id);
  }

  if (featured !== undefined) {
    filtered = filtered.filter((p) => p.is_featured === featured);
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'price_asc':
        return a.base_price_krw - b.base_price_krw;
      case 'price_desc':
        return b.base_price_krw - a.base_price_krw;
      case 'popular':
        return b.view_count - a.view_count;
      default:
        return 0;
    }
  });

  const total = filtered.length;
  const offset = (page - 1) * per_page;
  const data = filtered.slice(offset, offset + per_page);

  return { data, total, page, per_page, has_next: offset + per_page < total };
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const [products, options, categories, sizes] = await Promise.all([
    getProducts(),
    getProductOptions(),
    getCategories(),
    getSizes(),
  ]);

  const product = products.find((p) => p.slug === slug);
  if (!product) return null;

  const category = categories.find((c) => c.id === product.category_id)!;
  const productOptions = options
    .filter((o) => o.product_id === product.id && o.is_active)
    .map((o) => ({
      ...o,
      size: sizes.find((s) => s.id === o.size_id),
    }));

  return { ...product, category, options: productOptions };
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) ?? null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const result = await listProducts({ featured: true, per_page: limit });
  return result.data;
}
