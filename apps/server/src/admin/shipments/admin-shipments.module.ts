import { Module } from '@nestjs/common';
import { AdminShipmentsController } from './admin-shipments.controller';
import { AdminShipmentsService } from './admin-shipments.service';
import { AdminModule } from '../admin.module';

@Module({
  imports: [AdminModule],
  controllers: [AdminShipmentsController],
  providers: [AdminShipmentsService],
})
export class AdminShipmentsModule {}
