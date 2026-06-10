import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminCommunityService } from './admin-community.service';
import { AdminAuthGuard } from '../common/admin-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  AdminListPostsQuerySchema,
  CommentStatusBodySchema,
  PostPinBodySchema,
  PostStatusBodySchema,
  UuidParamSchema,
} from './admin-community.schemas';

//   GET   /admin/community/posts                list
//   GET   /admin/community/posts/:id            detail (+ comments)
//   PATCH /admin/community/posts/:id/status     ACTIVE/HIDDEN/DELETED
//   PATCH /admin/community/posts/:id/pin        is_pinned toggle
//   PATCH /admin/community/comments/:id/status  ACTIVE/HIDDEN/DELETED

@Controller('admin/community')
@UseGuards(AdminAuthGuard)
export class AdminCommunityController {
  constructor(private readonly community: AdminCommunityService) {}

  @Get('posts')
  listPosts(
    @Query(new ZodValidationPipe(AdminListPostsQuerySchema))
    query: typeof AdminListPostsQuerySchema._output
  ) {
    return this.community.listPosts(query);
  }

  @Get('posts/:id')
  async getPost(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output
  ) {
    const post = await this.community.getPost(params.id);
    if (!post) throw new NotFoundException('post_not_found');
    return post;
  }

  @Patch('posts/:id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setPostStatus(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(PostStatusBodySchema))
    body: typeof PostStatusBodySchema._output
  ) {
    await this.community.setPostStatus(params.id, body.status);
  }

  @Patch('posts/:id/pin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setPostPin(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(PostPinBodySchema)) body: typeof PostPinBodySchema._output
  ) {
    await this.community.setPostPinned(params.id, body.is_pinned);
  }

  @Patch('comments/:id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setCommentStatus(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(CommentStatusBodySchema))
    body: typeof CommentStatusBodySchema._output
  ) {
    await this.community.setCommentStatus(params.id, body.status);
  }
}
