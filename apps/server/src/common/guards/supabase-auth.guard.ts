import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { SUPABASE_ANON } from '../../supabase/supabase.module';

// Attaches `request.user` if a valid Bearer token is present.
// Throws 401 when missing/invalid.
//
// Routes that allow anonymous traffic should compose a softer variant
// (or simply omit this guard); we'll add `@Public()` once a controller
// genuinely needs partial auth.

declare module 'express' {
  interface Request {
    user?: User;
    /** The raw JWT, so downstream services can build user-scoped Supabase clients. */
    accessToken?: string;
  }
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(@Inject(SUPABASE_ANON) private readonly supabase: SupabaseClient) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('unauthorized');
    }
    const token = header.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('unauthorized');
    }

    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data?.user) {
      if (error) this.logger.debug(`auth.getUser failed: ${error.message}`);
      throw new UnauthorizedException('unauthorized');
    }

    req.user = data.user;
    req.accessToken = token;
    return true;
  }
}
