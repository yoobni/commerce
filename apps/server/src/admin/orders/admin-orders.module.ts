import { Module } from '@nestjs/common';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminModule } from '../admin.module';

@Module({
  imports: [AdminModule],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService],
})
export class AdminOrdersModule {}
