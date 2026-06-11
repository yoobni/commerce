import { Module } from '@nestjs/common';
import {
  AdminCategoriesController,
  AdminProductsController,
  AdminSizesController,
} from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminModule } from '../admin.module';

@Module({
  imports: [AdminModule],
  controllers: [AdminProductsController, AdminCategoriesController, AdminSizesController],
  providers: [AdminProductsService],
})
export class AdminProductsModule {}
