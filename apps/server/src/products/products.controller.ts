import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ListProductsQuerySchema,
  SlugParamSchema,
  UuidParamSchema,
} from './products.schemas';

// REST resource: products.
//   GET /products            — list (filters/sort/pagination all via query)
//                              supported query: q, ids, exclude, featured,
//                              status, category_slug, size_labels, colors,
//                              min_price_krw, max_price_krw, sort, page, per_page
//   GET /products/:slug      — single product by slug (SEO-friendly default)
//   GET /products/by-id/:id  — single product by UUID (admin / internal use)
//
// No action-style endpoints (/featured, /search, /by-ids, /colors removed).
// /colors moved to /product-options/colors.

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(ListProductsQuerySchema))
    query: typeof ListProductsQuerySchema._output
  ) {
    return this.products.list(query);
  }

  // Static segment ahead of :slug so it's resolved first.
  @Get('by-id/:id')
  async getById(
    @Param(new ZodValidationPipe(UuidParamSchema))
    params: typeof UuidParamSchema._output
  ) {
    const product = await this.products.getById(params.id);
    if (!product) throw new NotFoundException('product_not_found');
    return product;
  }

  @Get(':slug')
  async getBySlug(
    @Param(new ZodValidationPipe(SlugParamSchema))
    params: typeof SlugParamSchema._output
  ) {
    const product = await this.products.getBySlug(params.slug);
    if (!product) throw new NotFoundException('product_not_found');
    return product;
  }
}
