'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ProductStatus } from '@commerce/types';
import type { ProductRow } from '@/lib/queries/products';
import {
  updateProductStatus,
  deleteProduct,
  duplicateProduct,
  bulkUpdateProductStatus,
} from '@/lib/actions/products';

// ─── Constants ────────────────────────────────────────────────────────────────

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

function getTotalStock(options: { stock: number; is_active: boolean }[]) {
  return options.filter((o) => o.is_active).reduce((sum, o) => sum + o.stock, 0);
}

// ─── Row action buttons ───────────────────────────────────────────────────────

function ProductRowActions({ product }: { product: ProductRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleVisibility() {
    const newStatus: ProductStatus = product.status === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN';
    startTransition(async () => {
      try {
        await updateProductStatus(product.id, newStatus);
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : '상태 변경 실패');
      }
    });
  }

  function handleDuplicate() {
    startTransition(async () => {
      try {
        await duplicateProduct(product.id);
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : '복사 실패');
      }
    });
  }

  function handleDelete() {
    if (!confirm(`"${product.name_ko}"을(를) 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await deleteProduct(product.id);
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : '삭제 실패');
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
      <Link
        href={`/products/${product.id}`}
        className="text-xs text-blue-500 hover:text-blue-700"
      >
        수정
      </Link>
      <button
        type="button"
        onClick={handleDuplicate}
        disabled={isPending}
        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40"
      >
        복사
      </button>
      <button
        type="button"
        onClick={handleToggleVisibility}
        disabled={isPending}
        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40"
      >
        {product.status === 'HIDDEN' ? '노출' : '숨김'}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
      >
        삭제
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  products: ProductRow[];
}

export function ProductTableClient({ products }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isBulkPending, startBulkTransition] = useTransition();

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkStatus(status: ProductStatus) {
    const ids = Array.from(selected);
    startBulkTransition(async () => {
      try {
        await bulkUpdateProductStatus(ids, status);
        setSelected(new Set());
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : '일괄 처리 실패');
      }
    });
  }

  return (
    <div>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-sm">
          <span className="text-blue-700 font-medium">{selected.size}개 선택됨</span>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={() => handleBulkStatus('ACTIVE')}
              disabled={isBulkPending}
              className="px-3 py-1 text-xs bg-white border border-[var(--color-border)] rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              일괄 판매중
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus('HIDDEN')}
              disabled={isBulkPending}
              className="px-3 py-1 text-xs bg-white border border-[var(--color-border)] rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              일괄 숨김
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus('SOLD_OUT')}
              disabled={isBulkPending}
              className="px-3 py-1 text-xs bg-white border border-[var(--color-border)] rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              일괄 품절
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              선택 해제
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                상품
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                카테고리
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
                가격 (KRW)
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
                재고
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                상태
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                등록일
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-[var(--color-text-tertiary)]"
                >
                  상품이 없습니다.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const totalStock = getTotalStock(product.options);
                const hasOptions = product.options.length > 0;
                const isOutOfStock = hasOptions && totalStock === 0;
                const isLowStock = hasOptions && totalStock > 0 && totalStock <= 5;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selected.has(product.id) ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => toggleOne(product.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
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
                    <td className="px-4 py-3 text-right">
                      {!hasOptions ? (
                        <span className="text-[var(--color-text-tertiary)]">-</span>
                      ) : (
                        <span
                          className={`font-medium ${
                            isOutOfStock
                              ? 'text-red-600'
                              : isLowStock
                                ? 'text-orange-500'
                                : 'text-[var(--color-text-primary)]'
                          }`}
                        >
                          {totalStock.toLocaleString()}
                          {isOutOfStock && (
                            <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-600">
                              품절
                            </span>
                          )}
                          {isLowStock && (
                            <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-600">
                              부족
                            </span>
                          )}
                        </span>
                      )}
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
                    <td className="px-4 py-3">
                      <ProductRowActions product={product} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
