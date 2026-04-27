import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ravidog.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/ko/account/', '/en/account/', '/ja/account/', '/de/account/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
