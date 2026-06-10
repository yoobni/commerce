import { Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';
import { ProductOptionsService } from './product-options.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

// REST resource: product-options (cross-product catalog views).
//   GET /product-options          — bulk lookup by ids=a,b,c (guest cart hydration)
//   GET /product-options/colors   — unique colors across active options

const ListOptionsQuerySchema = z.object({
  ids: z
    .string()
    .optional()
    .transform((s) =>
      s
        ? s
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : undefined
    ),
});

@Controller('product-options')
export class ProductOptionsController {
  constructor(private readonly options: ProductOptionsService) {}

  @Get()
  async list(
    @Query(new ZodValidationPipe(ListOptionsQuerySchema))
    query: typeof ListOptionsQuerySchema._output
  ) {
    // `ids` is the only supported filter for now — callers asking for an
    // unfiltered list get an empty page (catalog options are exposed per
    // product via /products/:slug).
    const ids = query.ids ?? [];
    return this.options.getByIds(ids);
  }

  @Get('colors')
  colors() {
    return this.options.listColors();
  }
}
