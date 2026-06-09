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
}

async function rawFetch(path: string, opts: ApiFetchOpts = {}): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.accessToken) headers.Authorization = `Bearer ${opts.accessToken}`;

  // Next.js fetch extensions are no-ops outside of RSC; safe to pass always.
  const next: RequestInit & { next?: { revalidate?: number } } = { headers };
  if (opts.noStore) {
    (next as { cache?: string }).cache = 'no-store';
  } else if (typeof opts.revalidate === 'number') {
    next.next = { revalidate: opts.revalidate };
  }
  return fetch(apiUrl(path), next);
}

/** GET a single-resource endpoint. Throws ApiCallError on any failure. */
export async function apiGetOne<T>(path: string, opts: ApiFetchOpts = {}): Promise<T> {
  const res = await rawFetch(path, opts);
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

/** GET a list endpoint. Returns { data, meta } so callers can render pagination. */
export async function apiGetList<T>(
  path: string,
  opts: ApiFetchOpts = {}
): Promise<{ data: T[]; meta: ListMeta }> {
  const res = await rawFetch(path, opts);
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

/**
 * SWR-compatible fetcher (client components). Single-resource shape.
 * For lists, use `apiGetList` directly inside the SWR fetcher arg.
 */
export const apiFetcher = <T = unknown>(path: string) => apiGetOne<T>(path);

