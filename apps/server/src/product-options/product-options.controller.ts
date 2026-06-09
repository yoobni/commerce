import { Controller, Get } from '@nestjs/common';
import { ProductOptionsService } from './product-options.service';

// REST resource: product-options (cross-product catalog views).
//   GET /product-options/colors  — unique colors across active options

@Controller('product-options')
export class ProductOptionsController {
  constructor(private readonly options: ProductOptionsService) {}

  @Get('colors')
  colors() {
    return this.options.listColors();
  }
}
