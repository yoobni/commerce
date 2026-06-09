import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { LikesService } from './likes.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { rateLimit } from '../../common/rate-limit';
import { CommentIdPathSchema, PostIdPathSchema } from './likes.schemas';

const LIKE_RATE = { windowMs: 60_000, max: 30 };

// REST resource: likes (polymorphic). Implemented as a toggle endpoint per
// the existing toggle_like RPC — POST is intentionally not idempotent here,
// matches the "tap heart" UX. A future v2 could split into PUT (set) /
// DELETE (clear) for idempotent clients.
//
//   POST /community/posts/:postId/likes        toggle post like (auth)
//   POST /community/comments/:commentId/likes  toggle comment like (auth)
//   GET  /community/posts/:postId/likes/me     viewer's like state (auth)
//   GET  /community/posts/:postId/comments/likes/me
//        viewer's liked comment ids under this post (auth) — used to render
//        initial heart-fills on the comment list.

@Controller('community')
export class LikesController {
  constructor(private readonly likes: LikesService) {}

  @Post('posts/:postId/likes')
  @UseGuards(SupabaseAuthGuard)
  async togglePost(
    @Req() req: Request,
    @Param(new ZodValidationPipe(PostIdPathSchema))
    params: typeof PostIdPathSchema._output
  ) {
    const userId = req.user!.id;
    this.guardRate(userId);
    return this.likes.toggle('POST', params.postId, userId);
  }

  @Post('comments/:commentId/likes')
  @UseGuards(SupabaseAuthGuard)
  async toggleComment(
    @Req() req: Request,
    @Param(new ZodValidationPipe(CommentIdPathSchema))
    params: typeof CommentIdPathSchema._output
  ) {
    const userId = req.user!.id;
    this.guardRate(userId);
    return this.likes.toggle('COMMENT', params.commentId, userId);
  }

  @Get('posts/:postId/likes/me')
  @UseGuards(SupabaseAuthGuard)
  async myPostLike(
    @Req() req: Request,
    @Param(new ZodValidationPipe(PostIdPathSchema))
    params: typeof PostIdPathSchema._output
  ) {
    const liked = await this.likes.hasLikedPost(params.postId, req.user!.id);
    return { liked };
  }

  @Get('posts/:postId/comments/likes/me')
  @UseGuards(SupabaseAuthGuard)
  async myCommentLikesForPost(
    @Req() req: Request,
    @Param(new ZodValidationPipe(PostIdPathSchema))
    params: typeof PostIdPathSchema._output
  ) {
    const ids = await this.likes.likedCommentIdsForPost(params.postId, req.user!.id);
    return { comment_ids: ids };
  }

  private guardRate(userId: string): void {
    const rl = rateLimit(`community:like:${userId}`, LIKE_RATE);
    if (!rl.ok) {
      throw new HttpException(
        { message: 'rate_limited', details: { retryAfterSec: rl.retryAfterSec } },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
  }
}
