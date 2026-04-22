import { notFound } from 'next/navigation';
import { adminGetProduct, adminListCategories, adminListSizes } from '@/lib/queries/products';
import { ProductForm } from '../_components/ProductForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [product, categories, sizes] = await Promise.all([
    adminGetProduct(id),
    adminListCategories(),
    adminListSizes(),
  ]);

  if (!product) notFound();

  return <ProductForm product={product} categories={categories} sizes={sizes} />;
}
