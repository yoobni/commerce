import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminProductsService } from './admin-products.service';
import { AdminAuthGuard } from '../common/admin-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  AdminListProductsQuerySchema,
  SaveCategoryBodySchema,
  SaveProductBodySchema,
  UpdateStatusBodySchema,
  UuidParamSchema,
} from './admin-products.schemas';

// Admin product / category / size resources.
//
// 같은 service (AdminProductsService) 가 세 도메인을 다루지만 외부 prefix 는
// 도메인별로 나눠 다른 admin module 의 컨벤션과 일치시킴.

@Controller('admin/products')
@UseGuards(AdminAuthGuard)
export class AdminProductsController {
  constructor(private readonly products: AdminProductsService) {}

  //   GET    /admin/products            list (status/category/search filter)
  //   GET    /admin/products/:id        detail
  //   POST   /admin/products            create (+ options batch)
  //   PATCH  /admin/products/:id        update (+ options batch)
  //   PATCH  /admin/products/:id/status quick status flip
  //   DELETE /admin/products/:id

  @Get()
  list(
    @Query(new ZodValidationPipe(AdminListProductsQuerySchema))
    query: typeof AdminListProductsQuerySchema._output
  ) {
    return this.products.list(query);
  }

  @Get(':id')
  async getById(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output
  ) {
    const row = await this.products.getById(params.id);
    if (!row) throw new NotFoundException('product_not_found');
    return row;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(SaveProductBodySchema))
    body: typeof SaveProductBodySchema._output
  ) {
    return this.products.save(null, body.product, body.options);
  }

  @Patch(':id')
  async update(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(SaveProductBodySchema))
    body: typeof SaveProductBodySchema._output
  ) {
    await this.products.assertProductExists(params.id);
    return this.products.save(params.id, body.product, body.options);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateStatus(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(UpdateStatusBodySchema))
    body: typeof UpdateStatusBodySchema._output
  ) {
    await this.products.assertProductExists(params.id);
    await this.products.updateStatus(params.id, body.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output
  ) {
    await this.products.delete(params.id);
  }
}

@Controller('admin/categories')
@UseGuards(AdminAuthGuard)
export class AdminCategoriesController {
  constructor(private readonly products: AdminProductsService) {}

  //   GET    /admin/categories      list (incl. inactive)
  //   POST   /admin/categories
  //   PATCH  /admin/categories/:id
  //   DELETE /admin/categories/:id  rejects when in use (→ 400 category_in_use)

  @Get()
  list() {
    return this.products.listCategories();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(SaveCategoryBodySchema))
    body: typeof SaveCategoryBodySchema._output
  ) {
    return this.products.saveCategory(null, body);
  }

  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(SaveCategoryBodySchema))
    body: typeof SaveCategoryBodySchema._output
  ) {
    return this.products.saveCategory(params.id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output
  ) {
    await this.products.deleteCategory(params.id);
  }
}

@Controller('admin/sizes')
@UseGuards(AdminAuthGuard)
export class AdminSizesController {
  constructor(private readonly products: AdminProductsService) {}

  //   GET /admin/sizes  list

  @Get()
  list() {
    return this.products.listSizes();
  }
}
