import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiOk } from '../api-response';

// Wraps every successful controller return value in `{ ok: true, data }` so
// clients can rely on a single envelope shape. Errors are wrapped by the
// global ExceptionFilter instead — that path never reaches this interceptor.
@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<T, ApiOk<T>> {
  intercept(_ctx: ExecutionContext, next: CallHandler<T>): Observable<ApiOk<T>> {
    return next.handle().pipe(map((data) => ({ ok: true, data })));
  }
}
