/**
 * Error utilities
 *
 * - AppError: typed domain error with code + status
 * - logError: normalized error logging (dev console, prod → reporting)
 * - parseApiError: parses fetch/Supabase errors into AppError
 * - isNotFound / isUnauthorized: guard helpers
 */

export type ErrorCode =
  | 'UNKNOWN'
  | 'NETWORK'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION'
  | 'PAYMENT_FAILED'
  | 'OUT_OF_STOCK'
  | 'COUPON_INVALID'
  | 'COUPON_EXPIRED'
  | 'ORDER_CONFLICT';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly context: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode = 'UNKNOWN',
    statusCode = 500,
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
  }

  static notFound(message = 'Not found') {
    return new AppError(message, 'NOT_FOUND', 404);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 'UNAUTHORIZED', 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 'FORBIDDEN', 403);
  }

  static validation(message: string, context?: Record<string, unknown>) {
    return new AppError(message, 'VALIDATION', 422, context ?? {});
  }

  static network(message = 'Network error') {
    return new AppError(message, 'NETWORK', 0);
  }
}

export interface LogErrorContext {
  context?: string;
  userId?: string | null;
  extra?: Record<string, unknown>;
}

/**
 * logError — normalized error logging.
 * In production, swap console.error for your error reporter (e.g. Sentry).
 */
export function logError(
  error: unknown,
  meta: LogErrorContext = {}
): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[error]', meta.context ?? 'unknown', error);
    return;
  }

  // TODO: Replace with Sentry or similar
  // Sentry.captureException(error, { extra: meta });
  console.error('[error]', meta.context, error instanceof Error ? error.message : error);
}

/**
 * parseApiError — converts raw fetch / Supabase errors into AppError.
 */
export async function parseApiError(response: Response): Promise<AppError> {
  let message = response.statusText || 'Request failed';

  try {
    const body = await response.json();
    if (typeof body?.message === 'string') message = body.message;
    else if (typeof body?.error === 'string') message = body.error;
  } catch {
    // ignore JSON parse failures
  }

  const code: ErrorCode =
    response.status === 404
      ? 'NOT_FOUND'
      : response.status === 401
      ? 'UNAUTHORIZED'
      : response.status === 403
      ? 'FORBIDDEN'
      : response.status === 422
      ? 'VALIDATION'
      : 'UNKNOWN';

  return new AppError(message, code, response.status);
}

export function isNotFound(error: unknown): boolean {
  return error instanceof AppError && error.code === 'NOT_FOUND';
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof AppError && error.code === 'UNAUTHORIZED';
}

export function isValidationError(error: unknown): boolean {
  return error instanceof AppError && error.code === 'VALIDATION';
}
