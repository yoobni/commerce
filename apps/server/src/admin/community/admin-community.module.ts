import { Module } from '@nestjs/common';
import { AdminCommunityController } from './admin-community.controller';
import { AdminCommunityService } from './admin-community.service';
import { AdminModule } from '../admin.module';

@Module({
  imports: [AdminModule],
  controllers: [AdminCommunityController],
  providers: [AdminCommunityService],
})
export class AdminCommunityModule {}
