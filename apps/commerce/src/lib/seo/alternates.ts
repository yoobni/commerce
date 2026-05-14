import { routing } from '@/i18n/routing';

type Alternates = {
  canonical: string;
  languages: Record<string, string>;
};

function normalizePath(path: string): string {
  if (!path.startsWith('/')) return `/${path}`;
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

/**
 * Build canonical + hreflang alternates for a given locale-stripped path.
 * `pathWithoutLocale` should not include the locale prefix (e.g. "/products/foo").
 */
export function buildAlternates(pathWithoutLocale: string, locale: string): Alternates {
  const path = normalizePath(pathWithoutLocale);
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `/${l}${path === '/' ? '' : path}`;
  }
  languages['x-default'] = `/${routing.defaultLocale}${path === '/' ? '' : path}`;
  return {
    canonical: `/${locale}${path === '/' ? '' : path}`,
    languages,
  };
}
