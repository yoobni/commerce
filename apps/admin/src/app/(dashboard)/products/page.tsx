import Link from 'next/link';
import type { ProductStatus } from '@commerce/types';
import { adminListProducts, adminListCategories } from '@/lib/queries/products';
import { ProductTableClient } from './_components/ProductTableClient';

// ─── Status tabs ──────────────────────────────────────────────────────────────

const STATUS_TABS: Array<{ value: ProductStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '판매중' },
  { value: 'DRAFT', label: '임시저장' },
  { value: 'SOLD_OUT', label: '품절' },
  { value: 'HIDDEN', label: '숨김' },
  { value: 'DISCONTINUED', label: '단종' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    status?: string;
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as ProductStatus | 'ALL') ?? 'ALL';
  const categoryId = params.category ?? '';
  const search = params.search ?? '';
  const page = Number(params.page ?? 1);

  const [result, categories] = await Promise.all([
    adminListProducts({
      status,
      category_id: categoryId || undefined,
      search: search || undefined,
      page,
    }),
    adminListCategories(),
  ]);

  function buildQuery(overrides: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    const merged = {
      status,
      category: categoryId || undefined,
      search: search || undefined,
      page: String(page),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined) q.set(k, v);
    });
    const str = q.toString();
    return str ? '?' + str : '';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">상품 관리</h1>
        <div className="flex gap-2">
          <Link
            href="/products/categories"
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-gray-50 text-[var(--color-text-secondary)]"
          >
            카테고리 관리
          </Link>
          <Link
            href="/products/new"
            className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90"
          >
            + 상품 등록
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/products${buildQuery({ status: tab.value, page: '1' })}`}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                status === tab.value
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Category + search filter */}
        <form method="GET" className="flex gap-2 ml-auto">
          <input type="hidden" name="status" value={status} />
          <select
            name="category"
            defaultValue={categoryId}
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none"
          >
            <option value="">전체 카테고리</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_ko}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="상품명 검색"
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90"
          >
            검색
          </button>
        </form>
      </div>

      {/* Table (client component for row/bulk actions) */}
      <ProductTableClient products={result.data} />

      {/* Pagination */}
      {result.total > result.per_page && (
        <div className="flex items-center justify-between mt-4 text-sm text-[var(--color-text-secondary)]">
          <span>
            총 {result.total.toLocaleString()}건 · {page}페이지
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/products${buildQuery({ page: String(page - 1) })}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                이전
              </Link>
            )}
            {result.has_next && (
              <Link
                href={`/products${buildQuery({ page: String(page + 1) })}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                다음
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
