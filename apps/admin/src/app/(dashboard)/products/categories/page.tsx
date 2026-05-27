import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { adminListCategories } from '@/lib/queries/products';
import { Button } from '@/components/ui';
import { CategoryManager } from './_components/CategoryManager';

export const metadata = { title: '카테고리 관리' };

export default async function CategoriesPage() {
  const categories = await adminListCategories();

  return (
    <div>
      <div className="mb-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> 상품 목록
          </Link>
        </Button>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
