// Shared fetcher + types for callers of @commerce/server (apps/server).
// Mirrors the server envelope so one fetcher covers every endpoint.
//
// Server envelope shapes:
//   single:  { ok, data: <item> }
//   list:    { ok, data: [items], meta: { total, page, per_page, has_next, has_previous, total_pages } }
//   error:   { ok: false, error, details? }

export interface ListMeta {
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_previous: boolean;
  total_pages: number;
}

export interface ApiOkSingle<T> {
  ok: true;
  data: T;
}

export interface ApiOkList<T> {
  ok: true;
  data: T[];
  meta: ListMeta;
}

export interface ApiErr {
  ok: false;
  error: string;
  details?: unknown;
}

export type ApiSingleResponse<T> = ApiOkSingle<T> | ApiErr;
export type ApiListResponse<T> = ApiOkList<T> | ApiErr;

export class ApiCallError extends Error {
  constructor(
    public code: string,
    public status: number,
    public details?: unknown
  ) {
    super(`[${status}] ${code}`);
    this.name = 'ApiCallError';
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4005';

/** Build a full API URL from a path (or accept an already-built URL). */
export function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${trimmed}`;
}

interface ApiFetchOpts {
  /** Server Components: per-request revalidate seconds for Next.js fetch cache. */
  revalidate?: number;
  /** Skip Next.js cache entirely. */
  noStore?: boolean;
  /** Bearer token to pass through (for user-scoped endpoints). */
  accessToken?: string;
  /** JSON body for non-GET methods. */
  body?: unknown;
}

async function rawFetch(
  method: string,
  path: string,
  opts: ApiFetchOpts = {}
): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.accessToken) headers.Authorization = `Bearer ${opts.accessToken}`;

  // Next.js fetch extensions are no-ops outside of RSC; safe to pass always.
  const init: RequestInit & { next?: { revalidate?: number } } = {
    method,
    headers,
  };
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(opts.body);
  }
  // Cache hints only meaningful for GET; safe to ignore for mutations.
  if (opts.noStore) {
    (init as { cache?: string }).cache = 'no-store';
  } else if (typeof opts.revalidate === 'number') {
    init.next = { revalidate: opts.revalidate };
  }
  return fetch(apiUrl(path), init);
}

async function readSingle<T>(res: Response): Promise<T> {
  let body: ApiSingleResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiSingleResponse<T>;
  } catch {
    /* non-JSON */
  }
  if (!res.ok || !body || body.ok === false) {
    const code = body && body.ok === false ? body.error : 'http_error';
    const details = body && body.ok === false ? body.details : undefined;
    throw new ApiCallError(code, res.status, details);
  }
  return body.data;
}

async function readList<T>(res: Response): Promise<{ data: T[]; meta: ListMeta }> {
  let body: ApiListResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiListResponse<T>;
  } catch {
    /* non-JSON */
  }
  if (!res.ok || !body || body.ok === false) {
    const code = body && body.ok === false ? body.error : 'http_error';
    const details = body && body.ok === false ? body.details : undefined;
    throw new ApiCallError(code, res.status, details);
  }
  return { data: body.data, meta: body.meta };
}

/** GET a single-resource endpoint. Throws ApiCallError on any failure. */
export async function apiGetOne<T>(path: string, opts: ApiFetchOpts = {}): Promise<T> {
  return readSingle<T>(await rawFetch('GET', path, opts));
}

/** GET a list endpoint. Returns { data, meta } so callers can render pagination. */
export async function apiGetList<T>(
  path: string,
  opts: ApiFetchOpts = {}
): Promise<{ data: T[]; meta: ListMeta }> {
  return readList<T>(await rawFetch('GET', path, opts));
}

/** POST returning a single-resource (or void) payload. */
export async function apiPost<T>(path: string, opts: ApiFetchOpts = {}): Promise<T> {
  const res = await rawFetch('POST', path, { ...opts, noStore: true });
  // 204 No Content — caller expected void.
  if (res.status === 204) return undefined as T;
  return readSingle<T>(res);
}

/** PATCH a single resource. Returns the updated payload (or void on 204). */
export async function apiPatch<T>(path: string, opts: ApiFetchOpts = {}): Promise<T> {
  const res = await rawFetch('PATCH', path, { ...opts, noStore: true });
  if (res.status === 204) return undefined as T;
  return readSingle<T>(res);
}

/** DELETE a resource. Returns void; throws on non-2xx. */
export async function apiDelete(path: string, opts: ApiFetchOpts = {}): Promise<void> {
  const res = await rawFetch('DELETE', path, { ...opts, noStore: true });
  if (res.status === 204) return;
  // Some endpoints may return a body on delete (e.g. soft-delete confirmation).
  if (res.ok) return;
  // Read error envelope.
  let body: ApiErr | null = null;
  try {
    body = (await res.json()) as ApiErr;
  } catch {
    /* non-JSON */
  }
  const code = body && body.ok === false ? body.error : 'http_error';
  const details = body && body.ok === false ? body.details : undefined;
  throw new ApiCallError(code, res.status, details);
}

/**
 * SWR-compatible fetcher (client components). Single-resource shape.
 * For lists, use `apiGetList` directly inside the SWR fetcher arg.
 */
export const apiFetcher = <T = unknown>(path: string) => apiGetOne<T>(path);

