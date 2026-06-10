import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';
import { hasPermission, type AdminRole } from './admin-roles';
import { verifySession, type AdminSessionPayload } from './admin-session';
import { ADMIN_ROLES_KEY } from './roles.decorator';

declare module 'express' {
  interface Request {
    admin?: AdminSessionPayload;
  }
}

// Validates the admin session bearer token, looks up the admin row, and
// ensures status=ACTIVE. Composes with @Roles('SUPER_ADMIN') for per-route
// role gates (defaults to OPERATOR or higher).

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient,
    private readonly reflector: Reflector
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('unauthorized');
    }
    const token = header.slice(7).trim();
    if (!token) throw new UnauthorizedException('unauthorized');

    const session = await verifySession(token);
    if (!session) throw new UnauthorizedException('unauthorized');

    // Re-check admin row each request so a deactivated admin loses access
    // immediately without waiting for the JWT to expire.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row } = await (this.supabase.from('admins') as any)
      .select('id, status, role')
      .eq('id', session.id)
      .single();

    if (!row || (row as { status: string }).status !== 'ACTIVE') {
      throw new UnauthorizedException('unauthorized');
    }

    // Trust the DB role over the JWT — role demotions take effect immediately.
    const liveRole = (row as { role: AdminRole }).role;
    req.admin = { ...session, role: liveRole };

    const required = this.reflector.getAllAndOverride<AdminRole | undefined>(
      ADMIN_ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()]
    );
    if (required && !hasPermission(liveRole, required)) {
      throw new ForbiddenException('forbidden');
    }
    return true;
  }
}
