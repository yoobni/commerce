import Link from 'next/link';
import type { ProductStatus } from '@commerce/types';
import { adminListProducts, type AdminProductRow } from '@/lib/queries/products';
import { adminListCategories } from '@/lib/queries/categories';
import { deleteProduct } from '@/lib/actions/products';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:       'bg-green-100 text-green-700',
  DRAFT:        'bg-gray-100 text-gray-600',
  SOLD_OUT:     'bg-yellow-100 text-yellow-700',
  HIDDEN:       'bg-blue-100 text-blue-700',
  DISCONTINUED: 'bg-red-100 text-red-600',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {status}
    </span>
  );
}

// ─── Delete Button ────────────────────────────────────────────────────────────

function DeleteButton({ productId, adminId }: { productId: string; adminId: string }) {
  async function handleDelete() {
    'use server';
    const result = await deleteProduct(productId, adminId);
    if (!result.ok) {
      // revalidatePath is called inside deleteProduct on success
      // On error we redirect with error param
      redirect(`/products?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/products');
  }

  return (
    <form action={handleDelete}>
      <button
        type="submit"
        className="text-xs text-[var(--color-error)] hover:underline"
        onClick={(e) => {
          if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            e.preventDefault();
          }
        }}
      >
        삭제
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface SearchParams {
  page?: string;
  status?: string;
  category_id?: string;
  search?: string;
  error?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1'));
  const status = (sp.status ?? 'ALL') as ProductStatus | 'ALL';
  const category_id = sp.category_id;
  const search = sp.search;

  const [{ data: products, total, has_next }, categories] = await Promise.all([
    adminListProducts({ page, status, category_id, search, per_page: 20 }),
    adminListCategories(),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name_ko]));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">상품 관리</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">총 {total.toLocaleString()}개</p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg"
          style={{ background: 'var(--color-brand-primary)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          상품 등록
        </Link>
      </div>

      {/* Error banner */}
      {sp.error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-[var(--color-error)]">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      {/* Filters */}
      <form className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1">상태</label>
          <select
            name="status"
            defaultValue={status}
            className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-white"
          >
            <option value="ALL">전체</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SOLD_OUT">SOLD_OUT</option>
            <option value="HIDDEN">HIDDEN</option>
            <option value="DISCONTINUED">DISCONTINUED</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1">카테고리</label>
          <select
            name="category_id"
            defaultValue={category_id ?? ''}
            className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-white"
          >
            <option value="">전체</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_ko}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1">검색</label>
          <input
            name="search"
            type="text"
            defaultValue={search ?? ''}
            placeholder="상품명 / 슬러그"
            className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg w-48"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-gray-50 transition-colors"
        >
          조회
        </button>

        {(status !== 'ALL' || category_id || search) && (
          <Link
            href="/products"
            className="px-4 py-2 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
          >
            초기화
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] w-16">이미지</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">상품명</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">카테고리</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">가격 (KRW)</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">상태</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">추천</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)]">액션</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                    조건에 맞는 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    categoryName={categoryMap.get(product.category_id) ?? '—'}
                    adminId={session.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {(page > 1 || has_next) && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/products?page=${page - 1}&status=${status}&${category_id ? `category_id=${category_id}&` : ''}${search ? `search=${search}` : ''}`}
              className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
            >
              이전
            </Link>
          )}
          <span className="text-sm text-[var(--color-text-secondary)]">페이지 {page}</span>
          {has_next && (
            <Link
              href={`/products?page=${page + 1}&status=${status}&${category_id ? `category_id=${category_id}&` : ''}${search ? `search=${search}` : ''}`}
              className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
            >
              다음
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────

function ProductRow({
  product,
  categoryName,
  adminId,
}: {
  product: AdminProductRow;
  categoryName: string;
  adminId: string;
}) {
  return (
    <tr className="border-b border-[var(--color-border-subtle)] hover:bg-gray-50 transition-colors">
      {/* Thumbnail */}
      <td className="px-4 py-3">
        {product.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail_url}
            alt={product.name_ko}
            className="w-12 h-12 object-cover rounded-lg border border-[var(--color-border)]"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <p className="font-medium text-[var(--color-text-primary)]">{product.name_ko}</p>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{product.name_en}</p>
        <p className="text-xs text-[var(--color-text-tertiary)] font-mono">{product.slug}</p>
      </td>

      {/* Category */}
      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{categoryName}</td>

      {/* Price */}
      <td className="px-4 py-3 text-[var(--color-text-primary)] font-mono">
        {product.base_price_krw.toLocaleString()}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={product.status} />
      </td>

      {/* Featured */}
      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
        {product.is_featured ? '✓' : '—'}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/products/${product.id}/edit`}
            className="text-xs text-[var(--color-brand-accent)] hover:underline font-medium"
          >
            수정
          </Link>
          <DeleteButton productId={product.id} adminId={adminId} />
        </div>
      </td>
    </tr>
  );
}
