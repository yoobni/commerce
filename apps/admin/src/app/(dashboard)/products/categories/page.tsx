import Link from 'next/link';
import { adminListCategories } from '@/lib/queries/products';
import { CategoryManager } from './_components/CategoryManager';

export default async function CategoriesPage() {
  const categories = await adminListCategories();

  return (
    <div>
      <div className="mb-2">
        <Link
          href="/products"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          ← 상품 목록
        </Link>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
