import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:4002';

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/community', priority: 0.7, changeFrequency: 'daily' },
];

function alternateLanguages(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of routing.locales) {
    map[l] = `${SITE_URL}/${l}${path}`;
  }
  map['x-default'] = `${SITE_URL}/${routing.defaultLocale}${path}`;
  return map;
}

async function getActiveProductSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('products') as any)
      .select('slug, updated_at')
      .eq('status', 'ACTIVE')
      .order('updated_at', { ascending: false })
      .limit(5000);
    if (error || !data) return [];
    return (data as { slug: string; updated_at: string }[]).map((p) => ({
      slug: p.slug,
      updatedAt: p.updated_at,
    }));
  } catch {
    return [];
  }
}

async function getActivePosts(): Promise<
  { shortId: string; slug: string; updatedAt: string }[]
> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('posts') as any)
      .select('short_id, slug, updated_at')
      .eq('status', 'ACTIVE')
      .order('updated_at', { ascending: false })
      .limit(5000);
    if (error || !data) return [];
    return (data as { short_id: string; slug: string; updated_at: string }[]).map((p) => ({
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
  const [products, posts] = await Promise.all([getActiveProductSlugs(), getActivePosts()]);

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
