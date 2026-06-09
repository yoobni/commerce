import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { z } from 'zod';
import { CategoriesService } from './categories.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

// REST resource: categories (public catalog).
//   GET /categories?active_only=true|false&shape=tree
//        flat list by default; ?shape=tree returns roots with children attached.
//   GET /categories/:slug  single by slug

const ListQuerySchema = z.object({
  active_only: z
    .string()
    .optional()
    .transform((s) => (s === 'false' ? false : true)),
  shape: z.enum(['flat', 'tree']).optional(),
});

const SlugParamSchema = z.object({
  slug: z.string().min(1).max(120),
});

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  async list(
    @Query(new ZodValidationPipe(ListQuerySchema))
    query: typeof ListQuerySchema._output
  ) {
    if (query.shape === 'tree') {
      return this.categories.listWithChildren();
    }
    return this.categories.list(query.active_only);
  }

  @Get(':slug')
  async getOne(
    @Param(new ZodValidationPipe(SlugParamSchema))
    params: typeof SlugParamSchema._output
  ) {
    const cat = await this.categories.getBySlug(params.slug);
    if (!cat) throw new NotFoundException('category_not_found');
    return cat;
  }
}
