import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { LoginBodySchema } from './admin-auth.schemas';
import { AdminAuthGuard } from '../common/admin-auth.guard';
import { CurrentAdmin } from '../common/current-admin.decorator';
import type { AdminSessionPayload } from '../common/admin-session';

// REST resource: admin auth.
//   POST   /admin/auth/login   — issue session token (anon)
//   POST   /admin/auth/logout  — revoke current session (auth)
//   GET    /admin/auth/me      — return current admin (auth)
//
// Cookie/CSRF concerns stay on the admin Next.js app — this controller
// returns the raw token so the admin shell can set its own httpOnly cookie.

function clientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  const fwdStr = Array.isArray(fwd) ? fwd[0] : fwd;
  return (
    fwdStr?.split(',')[0]?.trim() ??
    (req.headers['x-real-ip'] as string | undefined) ??
    req.ip ??
    'unknown'
  );
}

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly auth: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginBodySchema))
    body: typeof LoginBodySchema._output,
    @Req() req: Request
  ) {
    const ua = (req.headers['user-agent'] as string | undefined) ?? 'unknown';
    return this.auth.login(body.email, body.password, clientIp(req), ua);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminAuthGuard)
  async logout(@Req() req: Request) {
    const header = req.headers.authorization;
    const token = header?.toLowerCase().startsWith('bearer ')
      ? header.slice(7).trim()
      : '';
    await this.auth.logout(token);
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  me(@CurrentAdmin() admin: AdminSessionPayload) {
    return admin;
  }
}
