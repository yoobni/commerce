import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { PointsService } from './points.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';

// REST resource: points (always scoped to the authenticated user).
//   GET /points/me/balance   own balance (auth)

@Controller('points')
@UseGuards(SupabaseAuthGuard)
export class PointsController {
  constructor(private readonly points: PointsService) {}

  @Get('me/balance')
  balance(@Req() req: Request) {
    return this.points.getBalanceForUser(req.user!.id);
  }
}
