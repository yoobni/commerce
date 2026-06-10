import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { listProducts } from '@/lib/api/products';
import { listPosts } from '@/lib/api/community/posts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:4002';

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/community', priority: 0.7, changeFrequency: 'daily' },
];

// Sitemap cap — same as the previous direct-Supabase implementation. Build-
// time fetch only, so a single per_page=5000 call is cheaper than paging.
const SITEMAP_CAP = 5000;

function alternateLanguages(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of routing.locales) {
    map[l] = `${SITE_URL}/${l}${path}`;
  }
  map['x-default'] = `${SITE_URL}/${routing.defaultLocale}${path}`;
  return map;
}

async function getActiveProducts(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const result = await listProducts({ status: 'ACTIVE', per_page: SITEMAP_CAP, sort: 'newest' });
    return result.data.map((p) => ({ slug: p.slug, updatedAt: p.updated_at }));
  } catch {
    return [];
  }
}

async function getActivePosts(): Promise<{ shortId: string; slug: string; updatedAt: string }[]> {
  try {
    const result = await listPosts({ per_page: SITEMAP_CAP, sort: 'newest' });
    return result.data.map((p) => ({
      shortId: p.short_id,
      slug: p.slug,
      updatedAt: p.updated_at,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [products, posts] = await Promise.all([getActiveProducts(), getActivePosts()]);

  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of STATIC_PATHS) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: { languages: alternateLanguages(path) },
      });
    }
  }

  for (const product of products) {
    const path = `/products/${product.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: { languages: alternateLanguages(path) },
      });
    }
  }

  for (const post of posts) {
    const path = `/community/${post.shortId}/${post.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: { languages: alternateLanguages(path) },
      });
    }
  }

  return entries;
}
