import { z } from 'zod';

const intParam = z
  .string()
  .optional()
  .transform((s) => (s ? parseInt(s, 10) : undefined))
  .pipe(z.number().int().positive().optional());

export const AdminListProductsQuerySchema = z.object({
  status: z.enum(['ALL', 'DRAFT', 'ACTIVE', 'SOLD_OUT', 'HIDDEN', 'DISCONTINUED']).optional(),
  category_id: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  page: intParam,
  per_page: intParam,
});

const OptionSchema = z.object({
  id: z.string().uuid().optional(),
  toDelete: z.boolean().optional(),
  size_id: z.string().uuid(),
  color: z.string().min(1).max(50),
  color_hex: z.string().nullable(),
  sku: z.string().min(1).max(80),
  additional_price_krw: z.number().int(),
  additional_price_usd: z.number().int(),
  additional_price_jpy: z.number().int(),
  additional_price_eur: z.number().int(),
  stock: z.number().int().min(0),
  low_stock_threshold: z.number().int().min(0),
  is_active: z.boolean(),
});

const ProductFieldsSchema = z.object({
  category_id: z.string().uuid(),
  slug: z.string().min(1).max(160),
  name_ko: z.string().min(1).max(200),
  name_en: z.string().min(1).max(200),
  name_ja: z.string().min(1).max(200),
  name_de: z.string().min(1).max(200),
  description_ko: z.string(),
  description_en: z.string(),
  description_ja: z.string(),
  description_de: z.string(),
  base_price_krw: z.number().int().min(0),
  base_price_usd: z.number().int().min(0),
  base_price_jpy: z.number().int().min(0),
  base_price_eur: z.number().int().min(0),
  material: z.string().nullable(),
  care_instruction: z.string().nullable(),
  weight_g: z.number().int().min(0).nullable(),
  thumbnail_url: z.string(),
  images: z.array(z.string()),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD_OUT', 'HIDDEN', 'DISCONTINUED']),
  is_featured: z.boolean(),
});

export const SaveProductBodySchema = z.object({
  product: ProductFieldsSchema,
  options: z.array(OptionSchema),
});

export const UpdateStatusBodySchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD_OUT', 'HIDDEN', 'DISCONTINUED']),
});

export const SaveCategoryBodySchema = z.object({
  parent_id: z.string().uuid().nullable(),
  slug: z.string().min(1).max(160),
  name_ko: z.string().min(1).max(200),
  name_en: z.string().min(1).max(200),
  name_ja: z.string().min(1).max(200),
  name_de: z.string().min(1).max(200),
  sort_order: z.number().int(),
  is_active: z.boolean(),
});

export const UuidParamSchema = z.object({ id: z.string().uuid() });
