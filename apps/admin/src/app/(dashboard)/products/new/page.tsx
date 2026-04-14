import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { adminListCategories } from '@/lib/queries/categories';
import { adminListSizes } from '@/lib/queries/sizes';
import { ProductForm } from '@/components/products/ProductForm';

export default async function NewProductPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [categories, sizes] = await Promise.all([
    adminListCategories(),
    adminListSizes(),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">상품 등록</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">새 상품을 등록합니다.</p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
        <ProductForm
          adminId={session.id}
          categories={categories}
          sizes={sizes}
        />
      </div>
    </div>
  );
}
