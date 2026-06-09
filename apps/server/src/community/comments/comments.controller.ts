import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CommentsService } from './comments.service';
import { PostsService } from '../posts/posts.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { OptionalSupabaseAuthGuard } from '../../common/guards/optional-supabase-auth.guard';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { rateLimit } from '../../common/rate-limit';
import {
  CommentIdPathSchema,
  CreateCommentBodySchema,
  ListCommentsQuerySchema,
  PostIdPathSchema,
  UpdateCommentBodySchema,
} from './comments.schemas';

const COMMENT_RATE = { windowMs: 5 * 60_000, max: 20 };

// REST resource: community comments — nested under posts for create/list,
// flat for direct mutations.
//
//   GET    /community/posts/:postId/comments     list (optional auth → block filter)
//   POST   /community/posts/:postId/comments     create (auth)
//   PATCH  /community/comments/:id               update (auth + owner)
//   DELETE /community/comments/:id               soft delete (auth + owner)

@Controller('community')
export class CommentsController {
  constructor(
    private readonly comments: CommentsService,
    private readonly posts: PostsService
  ) {}

  @Get('posts/:postId/comments')
  @UseGuards(OptionalSupabaseAuthGuard)
  async list(
    @Req() req: Request,
    @Param(new ZodValidationPipe(PostIdPathSchema))
    params: typeof PostIdPathSchema._output,
    @Query(new ZodValidationPipe(ListCommentsQuerySchema))
    query: typeof ListCommentsQuerySchema._output
  ) {
    const userId = req.user?.id ?? null;
    const blockedIds = await this.posts.getBlockedUserIds(userId);
    return this.comments.list(
      params.postId,
      query.page,
      query.per_page,
      blockedIds.length > 0 ? blockedIds : undefined
    );
  }

  @Post('posts/:postId/comments')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request,
    @Param(new ZodValidationPipe(PostIdPathSchema))
    params: typeof PostIdPathSchema._output,
    @Body(new ZodValidationPipe(CreateCommentBodySchema))
    body: typeof CreateCommentBodySchema._output
  ) {
    const userId = req.user!.id;
    const rl = rateLimit(`community:comment:${userId}`, COMMENT_RATE);
    if (!rl.ok) {
      throw new HttpException(
        { message: 'rate_limited', details: { retryAfterSec: rl.retryAfterSec } },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    // Reject orphan comments — post must exist and be active.
    const ownerId = await this.posts.getOwnerId(params.postId);
    if (!ownerId) throw new NotFoundException('post_not_found');
    return this.comments.create(params.postId, userId, body.content, body.parent_id ?? null);
  }

  @Patch('comments/:id')
  @UseGuards(SupabaseAuthGuard)
  async update(
    @Req() req: Request,
    @Param(new ZodValidationPipe(CommentIdPathSchema))
    params: typeof CommentIdPathSchema._output,
    @Body(new ZodValidationPipe(UpdateCommentBodySchema))
    body: typeof UpdateCommentBodySchema._output
  ) {
    const userId = req.user!.id;
    const rl = rateLimit(`community:comment:${userId}`, COMMENT_RATE);
    if (!rl.ok) {
      throw new HttpException(
        { message: 'rate_limited', details: { retryAfterSec: rl.retryAfterSec } },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    const ownerId = await this.comments.getOwnerId(params.id);
    if (!ownerId) throw new NotFoundException('comment_not_found');
    if (ownerId !== userId) throw new ForbiddenException('forbidden');
    await this.comments.update(params.id, body.content);
    return { id: params.id };
  }

  @Delete('comments/:id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request,
    @Param(new ZodValidationPipe(CommentIdPathSchema))
    params: typeof CommentIdPathSchema._output
  ) {
    const userId = req.user!.id;
    const ownerId = await this.comments.getOwnerId(params.id);
    if (!ownerId) throw new NotFoundException('comment_not_found');
    if (ownerId !== userId) throw new ForbiddenException('forbidden');
    await this.comments.softDelete(params.id);
    return;
  }
}
