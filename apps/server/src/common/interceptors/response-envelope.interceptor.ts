import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Wire-format envelope. Two shapes:
//   single:    { ok, data: <item> }
//   list:      { ok, data: <items[]>, meta: { total, page, per_page, has_next, has_previous, total_pages } }
// Errors are handled by AllExceptionsFilter — never reach this interceptor.
//
// Controllers can either:
//   a) return a plain value/object — wrapped as single
//   b) return PaginatedResponse<T> ({ data, total, page, per_page, has_next }) —
//      auto-reshaped to list envelope (meta computed: has_previous, total_pages)
//   c) return ListEnvelope manually — passed through as-is

interface PaginatedShape<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

function isPaginated(v: unknown): v is PaginatedShape<unknown> {
  return (
    !!v &&
    typeof v === 'object' &&
    Array.isArray((v as { data?: unknown }).data) &&
    typeof (v as { total?: unknown }).total === 'number' &&
    typeof (v as { page?: unknown }).page === 'number' &&
    typeof (v as { per_page?: unknown }).per_page === 'number'
  );
}

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    return next.handle().pipe(
      map((value) => {
        if (isPaginated(value)) {
          const { data, total, page, per_page, has_next } = value;
          const total_pages = per_page > 0 ? Math.ceil(total / per_page) : 0;
          return {
            ok: true,
            data,
            meta: {
              total,
              page,
              per_page,
              has_next,
              has_previous: page > 1,
              total_pages,
            },
          };
        }
        return { ok: true, data: value };
      })
    );
  }
}
