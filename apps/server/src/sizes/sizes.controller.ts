import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { z } from 'zod';
import { SizesService } from './sizes.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

const IdParamSchema = z.object({
  id: z.string().uuid(),
});

@Controller('sizes')
export class SizesController {
  constructor(private readonly sizes: SizesService) {}

  @Get()
  list() {
    return this.sizes.list();
  }

  @Get(':id')
  async getOne(
    @Param(new ZodValidationPipe(IdParamSchema))
    params: typeof IdParamSchema._output
  ) {
    const size = await this.sizes.getById(params.id);
    if (!size) throw new NotFoundException('size_not_found');
    return size;
  }
}
