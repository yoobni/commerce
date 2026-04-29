import { NextResponse } from 'next/server';
import { listProducts } from '@/lib/queries/products';
import type { ProductListParams } from '@/lib/queries/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category_slug = searchParams.get('category') || undefined;
  const rawSort = searchParams.get('sort') || 'newest';
  const VALID_SORTS = ['newest', 'price_asc', 'price_desc', 'popular'] as const;
  type ValidSort = (typeof VALID_SORTS)[number];
  const sort: ValidSort = (VALID_SORTS as readonly string[]).includes(rawSort)
    ? (rawSort as ValidSort)
    : 'newest';

  const sizeParam = searchParams.get('size');
  const colorParam = searchParams.get('color');
  const minParam = searchParams.get('min_price');
  const maxParam = searchParams.get('max_price');
  const pageParam = searchParams.get('page');
  const perPageParam = searchParams.get('per_page');
  const q = searchParams.get('q') || undefined;

  const size_labels = sizeParam ? sizeParam.split(',').filter(Boolean) : undefined;
  const colors = colorParam ? colorParam.split(',').filter(Boolean) : undefined;
  const min_price_krw = minParam ? parseInt(minParam, 10) : undefined;
  const max_price_krw = maxParam ? parseInt(maxParam, 10) : undefined;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const per_page = perPageParam ? Math.min(48, Math.max(1, parseInt(perPageParam, 10))) : 24;

  try {
    const result = await listProducts({
      category_slug,
      sort,
      size_labels,
      colors,
      min_price_krw,
      max_price_krw,
      page,
      per_page,
      q,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
