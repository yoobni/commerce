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

// Admin product, category, size resources. All routes require admin auth.
//
//   GET    /admin/products                    list (status/category/search filter)
//   GET    /admin/products/:id                detail
//   POST   /admin/products                    create (+ options batch)
//   PATCH  /admin/products/:id                update (+ options batch)
//   PATCH  /admin/products/:id/status         quick status flip
//   DELETE /admin/products/:id                delete
//   GET    /admin/categories                  list (incl. inactive)
//   POST   /admin/categories                  create
//   PATCH  /admin/categories/:id              update
//   DELETE /admin/categories/:id              delete (rejects when in use)
//   GET    /admin/sizes                       list

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminProductsController {
  constructor(private readonly products: AdminProductsService) {}

  // ─── Products ─────────────────────────────────────────────────────────────

  @Get('products')
  list(
    @Query(new ZodValidationPipe(AdminListProductsQuerySchema))
    query: typeof AdminListProductsQuerySchema._output
  ) {
    return this.products.list(query);
  }

  @Get('products/:id')
  async getById(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output
  ) {
    const row = await this.products.getById(params.id);
    if (!row) throw new NotFoundException('product_not_found');
    return row;
  }

  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(SaveProductBodySchema))
    body: typeof SaveProductBodySchema._output
  ) {
    return this.products.save(null, body.product, body.options);
  }

  @Patch('products/:id')
  async update(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(SaveProductBodySchema))
    body: typeof SaveProductBodySchema._output
  ) {
    await this.products.assertProductExists(params.id);
    return this.products.save(params.id, body.product, body.options);
  }

  @Patch('products/:id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateStatus(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(UpdateStatusBodySchema))
    body: typeof UpdateStatusBodySchema._output
  ) {
    await this.products.assertProductExists(params.id);
    await this.products.updateStatus(params.id, body.status);
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output
  ) {
    await this.products.delete(params.id);
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  @Get('categories')
  listCategories() {
    return this.products.listCategories();
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  createCategory(
    @Body(new ZodValidationPipe(SaveCategoryBodySchema))
    body: typeof SaveCategoryBodySchema._output
  ) {
    return this.products.saveCategory(null, body);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(SaveCategoryBodySchema))
    body: typeof SaveCategoryBodySchema._output
  ) {
    return this.products.saveCategory(params.id, body);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output
  ) {
    await this.products.deleteCategory(params.id);
  }

  // ─── Sizes ────────────────────────────────────────────────────────────────

  @Get('sizes')
  listSizes() {
    return this.products.listSizes();
  }
}
