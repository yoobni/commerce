import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { adminGetProductDetail } from '@/lib/queries/products';
import { adminListCategories } from '@/lib/queries/categories';
import { adminListSizes } from '@/lib/queries/sizes';
import { ProductForm } from '@/components/products/ProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;

  const [product, categories, sizes] = await Promise.all([
    adminGetProductDetail(id),
    adminListCategories(),
    adminListSizes(),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">상품 수정</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {product.name_ko}
          <span className="ml-2 font-mono text-xs text-[var(--color-text-tertiary)]">
            {product.slug}
          </span>
        </p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
        <ProductForm
          adminId={session.id}
          categories={categories}
          sizes={sizes}
          initialData={product}
        />
      </div>
    </div>
  );
}
