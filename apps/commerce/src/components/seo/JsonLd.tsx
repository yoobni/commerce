/**
 * JSON-LD structured data component.
 * Renders schema.org markup for SEO — Product, BreadcrumbList, Organization.
 */

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Schema builders ──────────────────────────────────────────────────────────

interface ProductSchemaInput {
  name: string;
  description: string;
  image: string[];
  url: string;
  sku: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  ratingValue?: number;
  reviewCount?: number;
  brand?: string;
}

export function buildProductSchema(p: ProductSchemaInput) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: p.image,
    url: p.url,
    sku: p.sku,
    brand: {
      '@type': 'Brand',
      name: p.brand ?? 'Ravidog',
    },
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: p.currency,
      availability: `https://schema.org/${p.availability}`,
      url: p.url,
    },
  };

  if (p.ratingValue !== undefined && p.reviewCount !== undefined && p.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: p.ratingValue.toFixed(1),
      reviewCount: p.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildOrganizationSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ravidog',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [],
  };
}
