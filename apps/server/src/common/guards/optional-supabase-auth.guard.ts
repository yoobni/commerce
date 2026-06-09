import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON } from '../../supabase/supabase.module';

// Soft auth: if a Bearer token is present and valid, attaches req.user;
// otherwise lets the request through anonymously. Use on read endpoints
// where the response shape depends on whether the caller is signed in
// (e.g. /community/posts ?mine=true, blocked-user filtering).
//
// An *invalid* token still passes — we treat it as anonymous rather than
// blocking, so a stale token in localStorage doesn't break public pages.

@Injectable()
export class OptionalSupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalSupabaseAuthGuard.name);

  constructor(@Inject(SUPABASE_ANON) private readonly supabase: SupabaseClient) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
      return true; // anonymous
    }
    const token = header.slice(7).trim();
    if (!token) return true;

    try {
      const { data, error } = await this.supabase.auth.getUser(token);
      if (error || !data?.user) {
        this.logger.debug(`optional auth: invalid token (${error?.message ?? 'no user'})`);
        return true; // treat as anonymous
      }
      req.user = data.user;
      req.accessToken = token;
    } catch (e) {
      this.logger.debug(`optional auth threw: ${(e as Error).message}`);
    }
    return true;
  }
}
