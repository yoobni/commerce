import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AdminSessionPayload } from './admin-session';

// Injects the authenticated admin into a route handler argument.
// Throws if used on a route that hasn't applied AdminAuthGuard.
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminSessionPayload => {
    const req = ctx.switchToHttp().getRequest<Request>();
    if (!req.admin) {
      throw new Error('CurrentAdmin used without AdminAuthGuard');
    }
    return req.admin;
  }
);
