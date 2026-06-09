import { Module } from '@nestjs/common';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { LikesController } from './likes/likes.controller';
import { LikesService } from './likes/likes.service';
import { UserBlocksController } from './user-blocks/user-blocks.controller';
import { UserBlocksService } from './user-blocks/user-blocks.service';

@Module({
  controllers: [
    PostsController,
    CommentsController,
    LikesController,
    UserBlocksController,
  ],
  providers: [PostsService, CommentsService, LikesService, UserBlocksService],
  exports: [PostsService, CommentsService, LikesService, UserBlocksService],
})
export class CommunityModule {}
