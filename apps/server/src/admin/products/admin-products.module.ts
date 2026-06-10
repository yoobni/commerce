import { Module } from '@nestjs/common';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminModule } from '../admin.module';

@Module({
  imports: [AdminModule],
  controllers: [AdminProductsController],
  providers: [AdminProductsService],
})
export class AdminProductsModule {}
