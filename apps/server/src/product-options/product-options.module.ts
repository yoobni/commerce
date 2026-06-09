import { Module } from '@nestjs/common';
import { ProductOptionsController } from './product-options.controller';
import { ProductOptionsService } from './product-options.service';

@Module({
  controllers: [ProductOptionsController],
  providers: [ProductOptionsService],
  exports: [ProductOptionsService],
})
export class ProductOptionsModule {}
