import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { getCategoryName } from '@/lib/format';
import type { Category, Locale } from '@commerce/types';

interface CategoryBreadcrumbProps {
  category: Category;
  parentCategory: Category | null;
  productName: string;
  locale: Locale;
  homeLabel: string;
  shopLabel: string;
}

export function CategoryBreadcrumb({
  category,
  parentCategory,
  productName,
  locale,
  homeLabel,
  shopLabel,
}: CategoryBreadcrumbProps) {
  const crumbs = [
    { label: homeLabel, href: '/' },
    { label: shopLabel, href: '/products' },
    ...(parentCategory
      ? [
          {
            label: getCategoryName(parentCategory, locale),
            href: `/products?category=${parentCategory.slug}`,
          },
        ]
      : []),
    {
      label: getCategoryName(category, locale),
      href: `/products?category=${category.slug}`,
    },
  ];

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronIcon />}
            <Link
              href={crumb.href}
              className={cn(
                'hover:text-[var(--color-text-primary)] transition-colors duration-150',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand-accent)] rounded-sm'
              )}
            >
              {crumb.label}
            </Link>
          </li>
        ))}
        {/* Current product — not a link */}
        <li className="flex items-center gap-1">
          <ChevronIcon />
          <span
            className="text-[var(--color-text-primary)] font-medium truncate max-w-[160px] md:max-w-[240px]"
            aria-current="page"
          >
            {productName}
          </span>
        </li>
      </ol>
    </nav>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-[var(--color-neutral-300)]"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
