// Shared SWR fetcher + types for client-side consumers of /api/*.
// Mirrors the server envelope in `src/lib/api/response.ts` so a single fetcher
// covers every endpoint.

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiErr {
  ok: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiOk<T> | ApiErr;

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

/**
 * SWR-compatible fetcher. Returns the unwrapped `data` payload on success;
 * throws ApiCallError on any non-2xx response so SWR's `error` slot fires.
 */
export async function apiFetcher<T = unknown>(input: string | URL | Request): Promise<T> {
  const res = await fetch(input, {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });

  // Try to read the JSON body even on error so we can surface the code.
  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    // Non-JSON response from an upstream proxy or similar. Treat as opaque.
  }

  if (!res.ok || !body || body.ok === false) {
    const code = body && body.ok === false ? body.error : 'http_error';
    const details = body && body.ok === false ? body.details : undefined;
    throw new ApiCallError(code, res.status, details);
  }

  return body.data;
}
