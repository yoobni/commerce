/**
 * JSON mock data loader — server-side only.
 * Reads from /data/*.json files at the repo root.
 * Replace with real Supabase calls once DB is ready.
 */

import path from 'path';
import { readFile } from 'fs/promises';
import type {
  Product,
  ProductOption,
  Category,
  Size,
  CountryConfig,
} from '@commerce/types';

const DATA_DIR = path.resolve(process.cwd(), '../../data');

async function loadJson<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

// ─── Cached loaders (per-request in Next.js) ─────────────────────────────────

let _products: Product[] | null = null;
let _options: ProductOption[] | null = null;
let _categories: Category[] | null = null;
let _sizes: Size[] | null = null;
let _countryConfigs: CountryConfig[] | null = null;

export async function getProducts(): Promise<Product[]> {
  if (!_products) _products = await loadJson<Product[]>('products.json');
  return _products;
}

export async function getProductOptions(): Promise<ProductOption[]> {
  if (!_options) _options = await loadJson<ProductOption[]>('product-options.json');
  return _options;
}

export async function getCategories(): Promise<Category[]> {
  if (!_categories) _categories = await loadJson<Category[]>('categories.json');
  return _categories;
}

export async function getSizes(): Promise<Size[]> {
  if (!_sizes) _sizes = await loadJson<Size[]>('sizes.json');
  return _sizes;
}

export async function getCountryConfigs(): Promise<CountryConfig[]> {
  if (!_countryConfigs) _countryConfigs = await loadJson<CountryConfig[]>('country-configs.json');
  return _countryConfigs;
}
