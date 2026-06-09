import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ByIdsQuerySchema,
  FeaturedQuerySchema,
  IdOrSlugParamSchema,
  ListProductsQuerySchema,
  SearchForPostQuerySchema,
  isUuid,
} from './products.schemas';

// All product routes are public catalog data — no auth gate.
//
// Static segments are declared BEFORE the wildcard `/:idOrSlug` so Nest's
// router doesn't capture them: /products/search must win over /products/:idOrSlug.

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  // GET /products?sort=...&page=...&q=...&size_labels=L,XL&colors=ink,oat
  @Get()
  list(
    @Query(new ZodValidationPipe(ListProductsQuerySchema))
    query: typeof ListProductsQuerySchema._output
  ) {
    return this.products.list(query);
  }

  // GET /products/featured?limit=8
  @Get('featured')
  featured(
    @Query(new ZodValidationPipe(FeaturedQuerySchema))
    query: typeof FeaturedQuerySchema._output
  ) {
    return this.products.getFeatured(query.limit);
  }

  // GET /products/colors
  @Get('colors')
  colors() {
    return this.products.listAvailableColors();
  }

  // GET /products/by-ids?ids=a,b,c
  @Get('by-ids')
  byIds(
    @Query(new ZodValidationPipe(ByIdsQuerySchema))
    query: typeof ByIdsQuerySchema._output
  ) {
    return this.products.getByIds(query.ids);
  }

  // GET /products/search?q=field+trench&exclude=a,b
  @Get('search')
  search(
    @Query(new ZodValidationPipe(SearchForPostQuerySchema))
    query: typeof SearchForPostQuerySchema._output
  ) {
    return this.products.searchForPost(query.q, query.exclude);
  }

  // GET /products/:idOrSlug — accepts both a UUID (returns lean Product) and
  // a slug (returns ProductWithDetails). Dispatching by shape keeps callers
  // from having to remember which key they used.
  @Get(':idOrSlug')
  async get(
    @Param(new ZodValidationPipe(IdOrSlugParamSchema))
    params: typeof IdOrSlugParamSchema._output
  ) {
    if (isUuid(params.idOrSlug)) {
      const product = await this.products.getById(params.idOrSlug);
      if (!product) throw new NotFoundException('product_not_found');
      return product;
    }
    const product = await this.products.getBySlug(params.idOrSlug);
    if (!product) throw new NotFoundException('product_not_found');
    return product;
  }
}
