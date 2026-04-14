import { createClient } from '@supabase/supabase-js';

/**
 * Admin client with service_role key — bypasses RLS.
 * SERVER ONLY — never import in client components.
 * Use only in server actions, cron jobs, or trusted server-side operations.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
