import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AppConfig } from '../config/configuration';

// Two client tokens are exposed:
//  - SUPABASE_ANON  — RLS-bound, used when the caller's JWT is forwarded
//  - SUPABASE_ADMIN — service-role, RLS-bypass; only use for ops that
//                     legitimately need to read across all users (e.g.
//                     materializing block lists for moderation).
//
// Per-request user-scoped clients (those that carry the caller's JWT
// in the Authorization header so RLS applies as the caller's identity)
// are constructed in route handlers via SupabaseClientFactory.

export const SUPABASE_ANON = Symbol('SUPABASE_ANON');
export const SUPABASE_ADMIN = Symbol('SUPABASE_ADMIN');

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_ANON,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>): SupabaseClient => {
        const supa = config.get('supabase', { infer: true });
        return createClient(supa.url, supa.anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
      },
    },
    {
      provide: SUPABASE_ADMIN,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>): SupabaseClient => {
        const supa = config.get('supabase', { infer: true });
        return createClient(supa.url, supa.serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
      },
    },
  ],
  exports: [SUPABASE_ANON, SUPABASE_ADMIN],
})
export class SupabaseModule {}
