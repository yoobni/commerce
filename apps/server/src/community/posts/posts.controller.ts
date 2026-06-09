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
import { PostsService } from './posts.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { OptionalSupabaseAuthGuard } from '../../common/guards/optional-supabase-auth.guard';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { rateLimit } from '../../common/rate-limit';
import {
  CreatePostBodySchema,
  ListPostsQuerySchema,
  PostIdParamSchema,
  PostUuidParamSchema,
  UpdatePostBodySchema,
} from './posts.schemas';

const POST_RATE = { windowMs: 5 * 60_000, max: 5 }; // per user

// REST resource: community posts.
//   GET    /community/posts              list (optional auth — mine/liked apply if signed in)
//   GET    /community/posts/:idOrShortId single
//   POST   /community/posts              create (auth)
//   PATCH  /community/posts/:id          update (auth + owner)
//   DELETE /community/posts/:id          soft delete (auth + owner)

@Controller('community/posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  @UseGuards(OptionalSupabaseAuthGuard)
  async list(
    @Req() req: Request,
    @Query(new ZodValidationPipe(ListPostsQuerySchema))
    query: typeof ListPostsQuerySchema._output
  ) {
    const userId = req.user?.id ?? null;
    const wantsMine = query.mine === true && !!userId;
    const wantsLiked = query.liked === true && !!userId;
    const blockedIds = wantsMine ? [] : await this.posts.getBlockedUserIds(userId);

    return this.posts.list({
      boardType: query.board_type,
      q: query.q,
      sort: query.sort,
      page: query.page,
      per_page: query.per_page,
      mentionsProductId: query.mentions_product_id,
      authorId: wantsMine ? userId! : undefined,
      likedByUserId: wantsLiked ? userId! : undefined,
      excludeAuthorIds: blockedIds.length > 0 ? blockedIds : undefined,
      includeHidden: wantsMine,
    });
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreatePostBodySchema))
    body: typeof CreatePostBodySchema._output
  ) {
    const userId = req.user!.id;
    const rl = rateLimit(`community:post:${userId}`, POST_RATE);
    if (!rl.ok) {
      throw new HttpException(
        { message: 'rate_limited', details: { retryAfterSec: rl.retryAfterSec } },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    return this.posts.create(userId, body);
  }

  // NOTE: static-segment routes (/posts/foo) are handled by sibling controllers
  // (e.g. comments at /community/posts/:postId/comments). Per-resource methods
  // here stay scoped to `posts` itself.

  @Get(':idOrShortId')
  async getOne(
    @Param(new ZodValidationPipe(PostIdParamSchema))
    params: typeof PostIdParamSchema._output
  ) {
    const post = await this.posts.getOne(params.idOrShortId);
    if (!post) throw new NotFoundException('post_not_found');
    return post;
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  async update(
    @Req() req: Request,
    @Param(new ZodValidationPipe(PostUuidParamSchema))
    params: typeof PostUuidParamSchema._output,
    @Body(new ZodValidationPipe(UpdatePostBodySchema))
    body: typeof UpdatePostBodySchema._output
  ) {
    const userId = req.user!.id;
    const rl = rateLimit(`community:post:${userId}`, POST_RATE);
    if (!rl.ok) {
      throw new HttpException(
        { message: 'rate_limited', details: { retryAfterSec: rl.retryAfterSec } },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    const ownerId = await this.posts.getOwnerId(params.id);
    if (!ownerId) throw new NotFoundException('post_not_found');
    if (ownerId !== userId) throw new ForbiddenException('forbidden');
    await this.posts.update(params.id, body);
    return { id: params.id };
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request,
    @Param(new ZodValidationPipe(PostUuidParamSchema))
    params: typeof PostUuidParamSchema._output
  ) {
    const userId = req.user!.id;
    const ownerId = await this.posts.getOwnerId(params.id);
    if (!ownerId) throw new NotFoundException('post_not_found');
    if (ownerId !== userId) throw new ForbiddenException('forbidden');
    await this.posts.softDelete(params.id);
    // 204 — Nest sends no body for HttpCode(NO_CONTENT) returning undefined.
    return;
  }
}
