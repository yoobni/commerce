import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodError } from 'zod';
import type { ApiErr } from '../api-response';

// Single catch-all so every error response goes out in the {ok:false, error, details}
// envelope. Avoids leaking internal stack traces or framework-specific shapes.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'internal_error';
    let details: unknown;

    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'invalid_input';
      details = exception.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        code = body;
      } else if (body && typeof body === 'object') {
        // Nest's HttpException stuffs `message` with what the caller passed
        // (e.g. `throw new NotFoundException('product_not_found')`) and fills
        // `error` with the generic status name ("Not Found"). Prefer message —
        // that's the intentional, machine-readable code.
        const obj = body as { error?: unknown; message?: unknown; details?: unknown };
        code = (typeof obj.message === 'string' && obj.message) ||
               (typeof obj.error === 'string' && obj.error) ||
               'http_error';
        details = obj.details;
      } else {
        code = 'http_error';
      }
    } else if (exception instanceof Error) {
      // Unexpected — log full stack server-side, expose only the generic code.
      this.logger.error(exception.message, exception.stack);
    }

    const body: ApiErr = { ok: false, error: code };
    if (details !== undefined) body.details = details;

    res.status(status).json(body);
  }
}
