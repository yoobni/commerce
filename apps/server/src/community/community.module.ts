import { Module } from '@nestjs/common';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';

// Community domain root. Add CommentsController / LikesController /
// UserBlocksController in Phase 2.b.
@Module({
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class CommunityModule {}
