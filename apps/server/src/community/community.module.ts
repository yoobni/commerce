import { Module } from '@nestjs/common';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';

// Community domain root. Likes + UserBlocks land in Phase 2.b.2.
@Module({
  controllers: [PostsController, CommentsController],
  providers: [PostsService, CommentsService],
  exports: [PostsService, CommentsService],
})
export class CommunityModule {}
