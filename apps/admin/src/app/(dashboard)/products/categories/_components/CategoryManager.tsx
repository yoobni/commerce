'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@commerce/types';
import type { CategoryInput } from '@/lib/actions/products';
import { saveCategory, deleteCategory } from '@/lib/actions/products';

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode =
  | 'list'
  | { type: 'new'; parentId: string | null }
  | { type: 'edit'; category: Category };

// ─── Blank form factory ───────────────────────────────────────────────────────

function blankInput(parentId: string | null): CategoryInput {
  return {
    parent_id: parentId,
    slug: '',
    name_ko: '',
    name_en: '',
    name_ja: '',
    name_de: '',
    sort_order: 0,
    is_active: true,
  };
}

function categoryToInput(c: Category): CategoryInput {
  return {
    parent_id: c.parent_id,
    slug: c.slug,
    name_ko: c.name_ko,
    name_en: c.name_en,
    name_ja: c.name_ja,
    name_de: c.name_de,
    sort_order: c.sort_order,
    is_active: c.is_active,
  };
}

// ─── Category form ────────────────────────────────────────────────────────────

interface FormPanelProps {
  title: string;
  initial: CategoryInput;
  categoryId: string | null;
  roots: Category[];
  onDone: () => void;
}

function CategoryFormPanel({ title, initial, categoryId, roots, onDone }: FormPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CategoryInput>(initial);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!form.slug) {
      setError('슬러그를 입력해주세요.');
      return;
    }
    if (!form.name_ko) {
      setError('카테고리명(한국어)을 입력해주세요.');
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        await saveCategory(categoryId, form);
        router.refresh();
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : '저장 실패');
      }
    });
  }

  return (
    <div className="border border-[var(--color-border)] rounded-xl p-5 bg-white space-y-4">
      <h3 className="font-medium text-[var(--color-text-primary)]">{title}</h3>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* parent */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            상위 카테고리
          </label>
          <select
            value={form.parent_id ?? ''}
            onChange={(e) => patch('parent_id', e.target.value || null)}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none"
          >
            <option value="">없음 (최상위)</option>
            {roots.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name_ko}
              </option>
            ))}
          </select>
        </div>

        {/* slug */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            슬러그 *
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => patch('slug', e.target.value)}
            placeholder="category-slug"
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg font-mono focus:outline-none"
          />
        </div>

        {/* name_ko */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            이름 (KO) *
          </label>
          <input
            type="text"
            value={form.name_ko}
            onChange={(e) => patch('name_ko', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none"
          />
        </div>

        {/* name_en */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            이름 (EN)
          </label>
          <input
            type="text"
            value={form.name_en}
            onChange={(e) => patch('name_en', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none"
          />
        </div>

        {/* name_ja */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            이름 (JA)
          </label>
          <input
            type="text"
            value={form.name_ja}
            onChange={(e) => patch('name_ja', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none"
          />
        </div>

        {/* name_de */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            이름 (DE)
          </label>
          <input
            type="text"
            value={form.name_de}
            onChange={(e) => patch('name_de', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none"
          />
        </div>

        {/* sort_order */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            정렬 순서
          </label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => patch('sort_order', Number(e.target.value))}
            min="0"
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none"
          />
        </div>

        {/* is_active */}
        <div className="flex items-center pt-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => patch('is_active', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-[var(--color-text-secondary)]">활성 표시</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? '저장 중...' : '저장'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-gray-50 text-[var(--color-text-secondary)]"
        >
          취소
        </button>
      </div>
    </div>
  );
}

// ─── Delete button ─────────────────────────────────────────────────────────────

function DeleteButton({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm('이 카테고리를 삭제하시겠습니까? 사용 중인 상품이 있으면 삭제할 수 없습니다.'))
      return;

    startTransition(async () => {
      try {
        await deleteCategory(categoryId);
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : '삭제 실패');
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-60"
    >
      {isPending ? '삭제 중...' : '삭제'}
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  categories: Category[];
}

export function CategoryManager({ categories }: Props) {
  const [mode, setMode] = useState<Mode>('list');

  const roots = categories.filter((c) => c.parent_id === null);
  const childrenOf = (id: string) => categories.filter((c) => c.parent_id === id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">카테고리 관리</h1>
        <button
          type="button"
          onClick={() => setMode({ type: 'new', parentId: null })}
          className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90"
        >
          + 카테고리 추가
        </button>
      </div>

      {/* New / Edit form */}
      {mode !== 'list' && (
        <CategoryFormPanel
          title={mode.type === 'new' ? '새 카테고리' : '카테고리 수정'}
          initial={mode.type === 'new' ? blankInput(mode.parentId) : categoryToInput(mode.category)}
          categoryId={mode.type === 'edit' ? mode.category.id : null}
          roots={roots}
          onDone={() => setMode('list')}
        />
      )}

      {/* Category tree */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[var(--color-text-tertiary)]">
            카테고리가 없습니다.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                  카테고리명
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                  슬러그
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                  정렬
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                  상태
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {roots.map((root) => (
                <>
                  {/* Root row */}
                  <tr key={root.id} className="bg-gray-50/50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                      {root.name_ko}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                      {root.slug}
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                      {root.sort_order}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          root.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {root.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setMode({ type: 'new', parentId: root.id })}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          하위 추가
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode({ type: 'edit', category: root })}
                          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        >
                          수정
                        </button>
                        <DeleteButton categoryId={root.id} />
                      </div>
                    </td>
                  </tr>

                  {/* Children rows */}
                  {childrenOf(root.id).map((child) => (
                    <tr key={child.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="pl-5 text-[var(--color-text-secondary)]">
                          └ {child.name_ko}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-tertiary)]">
                        {child.slug}
                      </td>
                      <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                        {child.sort_order}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            child.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {child.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setMode({ type: 'edit', category: child })}
                            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                          >
                            수정
                          </button>
                          <DeleteButton categoryId={child.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
