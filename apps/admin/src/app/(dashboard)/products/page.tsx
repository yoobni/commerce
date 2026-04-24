import Link from 'next/link';
import type { ProductStatus } from '@commerce/types';
import { adminListProducts, adminListCategories } from '@/lib/queries/products';
import {
  PageHeader,
  StatusTabs,
  SearchBar,
  SectionCard,
  Pagination,
  Badge,
} from '@/components/ui';

// ─── Labels & badge variants ───────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'accent';

const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT: '임시저장',
  ACTIVE: '판매중',
  SOLD_OUT: '품절',
  HIDDEN: '숨김',
  DISCONTINUED: '단종',
};

const PRODUCT_STATUS_VARIANT: Record<ProductStatus, BadgeVariant> = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  SOLD_OUT: 'warning',
  HIDDEN: 'accent',
  DISCONTINUED: 'danger',
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
    adminListProducts({ status, category_id: categoryId || undefined, search: search || undefined, page }),
    adminListCategories(),
  ]);

  function buildQuery(overrides: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
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
      <PageHeader
        title="상품 관리"
        actions={
          <>
            <Link
              href="/products/categories"
              className="px-3 py-1.5 text-xs font-medium border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              카테고리 관리
            </Link>
            <Link
              href="/products/new"
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
            >
              + 상품 등록
            </Link>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-start gap-3 mb-6">
        <StatusTabs
          tabs={STATUS_TABS}
          current={status}
          buildHref={(value) =>
            `/products${buildQuery({ status: value, page: '1' })}`
          }
        />
        <SearchBar
          defaultValue={search}
          placeholder="상품명 검색"
          hiddenFields={[
            { name: 'status', value: status },
            ...(categoryId ? [{ name: 'category', value: categoryId }] : []),
          ]}
          resetHref={`/products${buildQuery({ search: undefined, page: '1' })}`}
          extraControls={
            <select
              name="category"
              defaultValue={categoryId}
              className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="">전체 카테고리</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ko}
                </option>
              ))}
            </select>
          }
        />
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상품</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">카테고리</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">가격 (KRW)</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {result.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                    상품이 없습니다.
                  </td>
                </tr>
              ) : (
                result.data.map((product) => (
                  <tr key={product.id} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/products/${product.id}`} className="flex items-center gap-3 group">
                        {product.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.thumbnail_url}
                            alt={product.name_ko}
                            className="w-10 h-10 object-cover rounded-lg border border-[var(--color-border)]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-link)] truncate">
                            {product.name_ko}
                          </p>
                          <p className="text-xs text-[var(--color-text-tertiary)] font-mono truncate">
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
                      <div className="flex items-center gap-1.5">
                        <Badge variant={PRODUCT_STATUS_VARIANT[product.status]}>
                          {PRODUCT_STATUS_LABEL[product.status]}
                        </Badge>
                        {product.is_featured && (
                          <Badge variant="purple">추천</Badge>
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
      </SectionCard>

      <Pagination
        page={page}
        total={result.total}
        perPage={result.per_page}
        hasNext={result.has_next}
        buildHref={(p) => `/products${buildQuery({ page: String(p) })}`}
      />
    </div>
  );
}
