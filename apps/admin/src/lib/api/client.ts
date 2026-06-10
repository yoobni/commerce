// Shared fetcher for callers of @commerce/server. Server-side only (admin
// runs entirely under Next.js Server Components / Server Actions).
//
// Server envelope:
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

export function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${trimmed}`;
}

interface ApiFetchOpts {
  revalidate?: number;
  noStore?: boolean;
  /** Admin session token (jose-signed JWT). */
  accessToken?: string;
  body?: unknown;
}

async function rawFetch(
  method: string,
  path: string,
  opts: ApiFetchOpts = {}
): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.accessToken) headers.Authorization = `Bearer ${opts.accessToken}`;

  const init: RequestInit & { next?: { revalidate?: number } } = { method, headers };
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(opts.body);
  }
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

export async function apiGetOne<T>(path: string, opts: ApiFetchOpts = {}): Promise<T> {
  return readSingle<T>(await rawFetch('GET', path, opts));
}

export async function apiGetList<T>(
  path: string,
  opts: ApiFetchOpts = {}
): Promise<{ data: T[]; meta: ListMeta }> {
  return readList<T>(await rawFetch('GET', path, opts));
}

export async function apiPost<T>(path: string, opts: ApiFetchOpts = {}): Promise<T> {
  const res = await rawFetch('POST', path, { ...opts, noStore: true });
  if (res.status === 204) return undefined as T;
  return readSingle<T>(res);
}

export async function apiPatch<T>(path: string, opts: ApiFetchOpts = {}): Promise<T> {
  const res = await rawFetch('PATCH', path, { ...opts, noStore: true });
  if (res.status === 204) return undefined as T;
  return readSingle<T>(res);
}

export async function apiDelete(path: string, opts: ApiFetchOpts = {}): Promise<void> {
  const res = await rawFetch('DELETE', path, { ...opts, noStore: true });
  if (res.status === 204) return;
  if (res.ok) return;
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
