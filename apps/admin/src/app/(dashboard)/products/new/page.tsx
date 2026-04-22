import { adminListCategories, adminListSizes } from '@/lib/queries/products';
import { ProductForm } from '../_components/ProductForm';

export default async function ProductNewPage() {
  const [categories, sizes] = await Promise.all([
    adminListCategories(),
    adminListSizes(),
  ]);

  return <ProductForm product={null} categories={categories} sizes={sizes} />;
}
