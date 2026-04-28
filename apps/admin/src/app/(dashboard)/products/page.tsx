import Link from 'next/link';
import type { ProductStatus } from '@commerce/types';
import { adminListProducts, adminListCategories } from '@/lib/queries/products';

// ─── Labels & badges ──────────────────────────────────────────────────────────

const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT: '임시저장',
  ACTIVE: '판매중',
  SOLD_OUT: '품절',
  HIDDEN: '숨김',
  DISCONTINUED: '단종',
};

const PRODUCT_STATUS_BADGE: Record<ProductStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-green-100 text-green-700',
  SOLD_OUT: 'bg-orange-100 text-orange-700',
  HIDDEN: 'bg-yellow-100 text-yellow-700',
  DISCONTINUED: 'bg-red-100 text-red-700',
};

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

        {/* Category filter */}
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

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                상품
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                카테고리
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
                가격 (KRW)
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                상태
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                등록일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {result.data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-[var(--color-text-tertiary)]"
                >
                  상품이 없습니다.
                </td>
              </tr>
            ) : (
              result.data.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex items-center gap-3 group"
                    >
                      {product.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.thumbnail_url}
                          alt={product.name_ko}
                          className="w-10 h-10 object-cover rounded-lg border border-[var(--color-border)]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-[var(--color-border)]" />
                      )}
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)] group-hover:text-blue-600">
                          {product.name_ko}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)] font-mono">
                          {product.slug}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {product.category?.name_ko ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[var(--color-text-primary)]">
                    {product.base_price_krw.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          PRODUCT_STATUS_BADGE[product.status]
                        }`}
                      >
                        {PRODUCT_STATUS_LABEL[product.status]}
                      </span>
                      {product.is_featured && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          추천
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {new Date(product.created_at).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
