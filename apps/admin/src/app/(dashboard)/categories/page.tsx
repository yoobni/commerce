import Link from 'next/link';
import type { Category } from '@commerce/types';
import {
  adminGetCategoryTree,
  adminGetCategory,
  type CategoryTree,
} from '@/lib/queries/categories';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategory,
} from '@/lib/actions/categories';

// ─── Form ─────────────────────────────────────────────────────────────────────

interface CategoryFormProps {
  mode: 'new-parent' | 'new-child' | 'edit';
  parentCategory?: Category | null;
  editingCategory?: Category | null;
}

function CategoryForm({ mode, parentCategory, editingCategory }: CategoryFormProps) {
  const isEdit = mode === 'edit';
  const isNewChild = mode === 'new-child';

  const title = isEdit
    ? `카테고리 수정: ${editingCategory?.name_ko ?? ''}`
    : isNewChild
    ? `하위 카테고리 추가 — ${parentCategory?.name_ko ?? ''}`
    : '상위 카테고리 추가';

  const action = isEdit ? updateCategory : createCategory;

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">{title}</h2>

      <form action={action} className="space-y-4">
        {isEdit && (
          <input type="hidden" name="id" value={editingCategory?.id} />
        )}
        {isNewChild && (
          <input type="hidden" name="parent_id" value={parentCategory?.id} />
        )}

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              이름 (KO) <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              name="name_ko"
              required
              defaultValue={editingCategory?.name_ko ?? ''}
              placeholder="예: 자켓"
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              이름 (EN) <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              name="name_en"
              required
              defaultValue={editingCategory?.name_en ?? ''}
              placeholder="예: Jacket"
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              이름 (JA)
            </label>
            <input
              type="text"
              name="name_ja"
              defaultValue={editingCategory?.name_ja ?? ''}
              placeholder="비워두면 영어로 대체"
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              이름 (DE)
            </label>
            <input
              type="text"
              name="name_de"
              defaultValue={editingCategory?.name_de ?? ''}
              placeholder="비워두면 영어로 대체"
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            슬러그
            <span className="ml-1 font-normal text-[var(--color-text-tertiary)]">
              (비워두면 영어 이름으로 자동 생성)
            </span>
          </label>
          <input
            type="text"
            name="slug"
            defaultValue={editingCategory?.slug ?? ''}
            placeholder="예: jacket"
            pattern="[a-z0-9-]+"
            title="소문자, 숫자, 하이픈만 허용"
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            id="is_active"
            defaultChecked={editingCategory?.is_active ?? true}
            className="w-4 h-4 rounded border-gray-300 accent-[var(--color-brand-primary)]"
          />
          <label htmlFor="is_active" className="text-sm text-[var(--color-text-secondary)]">
            활성화 (커머스에 노출)
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white rounded-lg"
            style={{ background: 'var(--color-brand-primary)' }}
          >
            {isEdit ? '저장' : '추가'}
          </button>
          <Link
            href="/categories"
            className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-lg transition-colors"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}

// ─── Sort Button ───────────────────────────────────────────────────────────────

function SortButton({
  id,
  parentId,
  direction,
  disabled,
}: {
  id: string;
  parentId: string | null;
  direction: 'up' | 'down';
  disabled: boolean;
}) {
  return (
    <form action={reorderCategory} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}
      <button
        type="submit"
        disabled={disabled}
        className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
          disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[var(--color-text-secondary)] hover:bg-gray-100 hover:text-[var(--color-text-primary)]'
        }`}
      >
        {direction === 'up' ? '↑' : '↓'}
      </button>
    </form>
  );
}

// ─── Delete Button ─────────────────────────────────────────────────────────────

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteCategory} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-[var(--color-error)] hover:underline"
        onClick={(e) => {
          if (!confirm('삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            e.preventDefault();
          }
        }}
      >
        삭제
      </button>
    </form>
  );
}

// ─── Tree Row ──────────────────────────────────────────────────────────────────

function ParentRow({
  node,
  isFirst,
  isLast,
}: {
  node: CategoryTree;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { parent } = node;
  return (
    <tr className="border-b border-[var(--color-border)] bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-tertiary)]">■</span>
          <div>
            <p className="font-semibold text-[var(--color-text-primary)] text-sm">{parent.name_ko}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">{parent.name_en}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs font-mono text-[var(--color-text-secondary)]">{parent.slug}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            parent.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {parent.is_active ? '활성' : '비활성'}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--color-text-tertiary)] font-mono">{parent.sort_order}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <SortButton id={parent.id} parentId={null} direction="up" disabled={isFirst} />
          <SortButton id={parent.id} parentId={null} direction="down" disabled={isLast} />
          <span className="mx-1 text-gray-300">|</span>
          <Link
            href={`/categories?form=new-child&parent_id=${parent.id}`}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            + 하위
          </Link>
          <span className="mx-1 text-gray-300">|</span>
          <Link
            href={`/categories?form=edit&id=${parent.id}`}
            className="text-xs text-[var(--color-brand-accent)] hover:underline font-medium"
          >
            수정
          </Link>
          <DeleteButton id={parent.id} />
        </div>
      </td>
    </tr>
  );
}

function ChildRow({
  child,
  parentId,
  isFirst,
  isLast,
}: {
  child: Category;
  parentId: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <tr className="border-b border-[var(--color-border-subtle,#f3f4f6)] hover:bg-gray-50 transition-colors">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2 pl-5">
          <span className="text-xs text-[var(--color-text-tertiary)]">└</span>
          <div>
            <p className="text-sm text-[var(--color-text-primary)]">{child.name_ko}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">{child.name_en}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-2.5 text-xs font-mono text-[var(--color-text-secondary)]">{child.slug}</td>
      <td className="px-4 py-2.5">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            child.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {child.is_active ? '활성' : '비활성'}
        </span>
      </td>
      <td className="px-4 py-2.5 text-xs text-[var(--color-text-tertiary)] font-mono">{child.sort_order}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1">
          <SortButton id={child.id} parentId={parentId} direction="up" disabled={isFirst} />
          <SortButton id={child.id} parentId={parentId} direction="down" disabled={isLast} />
          <span className="mx-1 text-gray-300">|</span>
          <Link
            href={`/categories?form=edit&id=${child.id}`}
            className="text-xs text-[var(--color-brand-accent)] hover:underline font-medium"
          >
            수정
          </Link>
          <DeleteButton id={child.id} />
        </div>
      </td>
    </tr>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    form?: string;
    parent_id?: string;
    id?: string;
    error?: string;
  }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const formMode = params.form as 'new-parent' | 'new-child' | 'edit' | undefined;
  const formParentId = params.parent_id;
  const formEditId = params.id;

  const [tree, editingCategory, parentCategory] = await Promise.all([
    adminGetCategoryTree(),
    formMode === 'edit' && formEditId ? adminGetCategory(formEditId) : Promise.resolve(null),
    formMode === 'new-child' && formParentId ? adminGetCategory(formParentId) : Promise.resolve(null),
  ]);

  const totalParents = tree.length;
  const totalChildren = tree.reduce((sum, node) => sum + node.children.length, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">카테고리 관리</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            상위 {totalParents}개 · 하위 {totalChildren}개
          </p>
        </div>
        <Link
          href="/categories?form=new-parent"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg"
          style={{ background: 'var(--color-brand-primary)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          상위 카테고리 추가
        </Link>
      </div>

      {/* Error banner */}
      {params.error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-[var(--color-error)]">
          {decodeURIComponent(params.error)}
        </div>
      )}

      {/* Form */}
      {formMode && (
        <CategoryForm
          mode={formMode}
          parentCategory={parentCategory}
          editingCategory={editingCategory}
        />
      )}

      {/* Tree table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--color-border)] bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">이름</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">슬러그</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">순서</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">액션</th>
            </tr>
          </thead>
          <tbody>
            {tree.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-[var(--color-text-tertiary)]">
                  <p className="text-base mb-1">카테고리가 없습니다.</p>
                  <p className="text-xs">위 버튼으로 첫 번째 카테고리를 추가하세요.</p>
                </td>
              </tr>
            ) : (
              tree.map((node, parentIdx) => (
                <>
                  <ParentRow
                    key={node.parent.id}
                    node={node}
                    isFirst={parentIdx === 0}
                    isLast={parentIdx === tree.length - 1}
                  />
                  {node.children.map((child, childIdx) => (
                    <ChildRow
                      key={child.id}
                      child={child}
                      parentId={node.parent.id}
                      isFirst={childIdx === 0}
                      isLast={childIdx === node.children.length - 1}
                    />
                  ))}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
