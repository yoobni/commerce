// Wire-format envelope for every endpoint.
// Mirrors apps/commerce/src/lib/api/response.ts on the client.

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
