import { Module } from '@nestjs/common';
import { AdminReviewsController } from './admin-reviews.controller';
import { AdminReviewsService } from './admin-reviews.service';
import { AdminModule } from '../admin.module';

@Module({
  imports: [AdminModule],
  controllers: [AdminReviewsController],
  providers: [AdminReviewsService],
})
export class AdminReviewsModule {}
