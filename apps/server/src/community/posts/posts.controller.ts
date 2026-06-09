import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { OptionalSupabaseAuthGuard } from '../../common/guards/optional-supabase-auth.guard';
import { ListPostsQuerySchema, PostIdParamSchema } from './posts.schemas';

// REST resource: community posts.
//   GET /community/posts            — list with filters
//      query: board_type, q, sort, page, per_page, mentions_product_id,
//             mine=true|false, liked=true|false
//      mine/liked are auth-required — if no Bearer token, they're ignored
//      and the call falls back to global ACTIVE posts.
//   GET /community/posts/:idOrShortId — single (UUID or short_id)
//
// Auth-conditional behavior:
//   - blocked-user filtering: applied when caller is authenticated (their
//     own blocks; never enforced for anonymous viewers).
//   - mine: ignored for anonymous; for authenticated, also returns HIDDEN
//     status (owner-view).

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

    // Mine view shows the user's own posts — no need to apply their own
    // block list against themselves.
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

  @Get(':idOrShortId')
  async getOne(
    @Param(new ZodValidationPipe(PostIdParamSchema))
    params: typeof PostIdParamSchema._output
  ) {
    const post = await this.posts.getOne(params.idOrShortId);
    if (!post) throw new NotFoundException('post_not_found');
    return post;
  }
}
