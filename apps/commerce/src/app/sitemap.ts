import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { listProducts } from '@/lib/queries/products';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ravidog.com';

function localeAlternates(path: string): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}${path}`]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: `${BASE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1.0,
      alternates: { languages: localeAlternates('') },
    },
    {
      url: `${BASE_URL}/${locale}/products`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: { languages: localeAlternates('/products') },
    },
  ]);

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const result = await listProducts({ status: 'ACTIVE', per_page: 500 });
    productRoutes = result.data.flatMap((product) =>
      locales.map((locale) => ({
        url: `${BASE_URL}/${locale}/products/${product.slug}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: localeAlternates(`/products/${product.slug}`),
        },
      }))
    );
  } catch {
    // DB unavailable — serve static routes only
  }

  return [...staticRoutes, ...productRoutes];
}
