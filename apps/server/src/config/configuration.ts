// Single source of truth for env-derived runtime config.
// Loaded by NestJS ConfigModule; injected via ConfigService elsewhere.

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  /** Comma-separated origins allowed by CORS. */
  corsOrigins: string[];
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
    /** Issuer claim used when verifying user JWTs. */
    jwtIssuer: string;
  };
}

export function loadConfig(): AppConfig {
  const env = process.env;

  function required(name: string): string {
    const v = env[name];
    if (!v) {
      throw new Error(`Missing required env: ${name}`);
    }
    return v;
  }

  const supabaseUrl = required('SUPABASE_URL');

  return {
    port: parseInt(env.PORT ?? '4005', 10),
    nodeEnv: (env.NODE_ENV as AppConfig['nodeEnv']) ?? 'development',
    corsOrigins: (env.CORS_ORIGINS ?? 'http://localhost:4002,http://localhost:4003')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    supabase: {
      url: supabaseUrl,
      anonKey: required('SUPABASE_ANON_KEY'),
      serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
      // GoTrue issuer is the project URL + /auth/v1.
      jwtIssuer: `${supabaseUrl}/auth/v1`,
    },
  };
}
