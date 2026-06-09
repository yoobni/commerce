// Token helpers for server-side fetch into @commerce/server.
// Server Components / Server Actions read the Supabase session from cookies
// and forward the access_token via `Authorization: Bearer ...` so the API can
// resolve `req.user`.

import { createClient } from '@/lib/supabase/server';

/** Returns the current user's access token, or null if unauthenticated. */
export async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
