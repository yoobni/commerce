/**
 * OAuth provider configuration
 *
 * Supabase handles the OAuth handshake — these configs define which providers
 * are available, their display metadata, and which locale/region they are
 * primarily intended for (for conditional rendering in the UI).
 *
 * To enable a provider:
 * 1. Enable it in Supabase Dashboard → Auth → Providers
 * 2. Set the required env vars below
 * 3. Flip `enabled: true`
 */

import type { Locale } from '@commerce/types';

export type OAuthProviderKey = 'google' | 'kakao' | 'naver' | 'twitter';

export interface OAuthProviderConfig {
  key: OAuthProviderKey;
  /** Supabase provider string passed to signInWithOAuth */
  supabaseProvider: 'google' | 'kakao' | 'twitter';
  /** i18n key under auth.* — e.g. "continueWithGoogle" */
  labelKey: string;
  /** Locales where this provider is shown by default */
  primaryLocales: Locale[];
  enabled: boolean;
}

export const OAUTH_PROVIDERS: OAuthProviderConfig[] = [
  {
    key: 'google',
    supabaseProvider: 'google',
    labelKey: 'continueWithGoogle',
    primaryLocales: ['ko', 'en', 'ja', 'de'],
    enabled: true,
  },
  {
    key: 'kakao',
    supabaseProvider: 'kakao',
    labelKey: 'continueWithKakao',
    primaryLocales: ['ko'],
    enabled: false, // enable after Supabase → Auth → Kakao setup
  },
  {
    key: 'naver',
    // Supabase does not have a built-in Naver provider; handled via custom OIDC.
    // Once configured, replace 'google' with the custom provider slug.
    supabaseProvider: 'google',
    labelKey: 'continueWithNaver',
    primaryLocales: ['ko', 'ja'],
    enabled: false, // enable after Supabase custom OIDC (Naver) setup
  },
  {
    key: 'twitter',
    supabaseProvider: 'twitter',
    labelKey: 'continueWithX',
    primaryLocales: ['en'],
    enabled: false, // enable after Supabase → Auth → Twitter (X) setup
  },
];

/** Returns providers enabled for a given locale (always includes global Google) */
export function getProvidersForLocale(locale: Locale): OAuthProviderConfig[] {
  return OAUTH_PROVIDERS.filter(
    (p) => p.enabled && p.primaryLocales.includes(locale)
  );
}
