import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserBlocksService } from './user-blocks.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { BlockBodySchema, TargetUserIdParamSchema } from './user-blocks.schemas';

// REST resource: user-blocks (always scoped to the calling user).
//   GET    /community/user-blocks/me              own block list (auth)
//   POST   /community/user-blocks                 block (auth)
//   DELETE /community/user-blocks/:targetUserId   unblock (auth)

@Controller('community/user-blocks')
@UseGuards(SupabaseAuthGuard)
export class UserBlocksController {
  constructor(private readonly blocks: UserBlocksService) {}

  @Get('me')
  async listMe(@Req() req: Request) {
    const ids = await this.blocks.listForViewer(req.user!.id);
    return { blocked_ids: ids };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async block(
    @Req() req: Request,
    @Body(new ZodValidationPipe(BlockBodySchema))
    body: typeof BlockBodySchema._output
  ) {
    const userId = req.user!.id;
    if (body.target_user_id === userId) {
      throw new BadRequestException('cannot_block_self');
    }
    await this.blocks.block(userId, body.target_user_id);
    return { target_user_id: body.target_user_id };
  }

  @Delete(':targetUserId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unblock(
    @Req() req: Request,
    @Param(new ZodValidationPipe(TargetUserIdParamSchema))
    params: typeof TargetUserIdParamSchema._output
  ) {
    const userId = req.user!.id;
    if (params.targetUserId === userId) {
      throw new ForbiddenException('forbidden');
    }
    await this.blocks.unblock(userId, params.targetUserId);
    return;
  }
}
