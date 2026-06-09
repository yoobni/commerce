// Shared helpers for Next.js Route Handlers (app/api/*).
// Goal: every route returns a consistent JSON envelope and a stable error code
// so the client SWR hooks don't have to special-case per endpoint.

import { NextResponse } from 'next/server';
import { z, type ZodError, type ZodSchema } from 'zod';

export interface ApiErrorBody {
  ok: false;
  error: string;
  /** Optional details — Zod issues, retry-after seconds, etc. */
  details?: unknown;
}

export interface ApiOkBody<T> {
  ok: true;
  data: T;
}

export type ApiBody<T> = ApiErrorBody | ApiOkBody<T>;

export function apiOk<T>(data: T, init?: ResponseInit): NextResponse<ApiOkBody<T>> {
  return NextResponse.json({ ok: true, data }, init);
}

export function apiError(
  code: string,
  status: number,
  details?: unknown
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ ok: false, error: code, details }, { status });
}

/** 401 — caller is not signed in. */
export const apiUnauthorized = () => apiError('unauthorized', 401);

/** 403 — signed in but not allowed to do this. */
export const apiForbidden = () => apiError('forbidden', 403);

/** 404 — target resource does not exist. */
export const apiNotFound = (what = 'not_found') => apiError(what, 404);

/** 429 — caller hit a rate limit. */
export const apiRateLimited = (retryAfterSec?: number) =>
  apiError('rate_limited', 429, retryAfterSec != null ? { retryAfterSec } : undefined);

/** 500 — unexpected error; never expose internals to the wire. */
export const apiInternal = () => apiError('internal_error', 500);

/**
 * Validates the URL search params against a zod schema. Returns either the
 * parsed object or a 400 NextResponse with the zod issues attached.
 */
export function parseSearchParams<T>(
  url: URL,
  schema: ZodSchema<T>
): { ok: true; data: T } | { ok: false; response: NextResponse<ApiErrorBody> } {
  const obj: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  const result = schema.safeParse(obj);
  if (!result.success) {
    return {
      ok: false,
      response: apiError('invalid_query', 400, formatZodError(result.error)),
    };
  }
  return { ok: true, data: result.data };
}

/**
 * Validates the JSON body of a request against a zod schema. Returns either
 * the parsed object or a 400 NextResponse.
 */
export async function parseJsonBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse<ApiErrorBody> }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: apiError('invalid_json', 400) };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      response: apiError('invalid_body', 400, formatZodError(result.error)),
    };
  }
  return { ok: true, data: result.data };
}

function formatZodError(err: ZodError): Array<{ path: string; message: string }> {
  return err.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }));
}

// Re-export zod for convenience so route files only need one import.
export { z };
