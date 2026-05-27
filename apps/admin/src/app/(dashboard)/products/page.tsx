import Link from 'next/link';
import { Search, Plus, FolderTree } from 'lucide-react';
import type { ProductStatus } from '@commerce/types';
import {
  adminListProducts,
  adminListCategories,
  PRODUCT_STATUS_LABEL,
  PRODUCT_STATUS_VARIANT,
} from '@/lib/queries/products';
import {
  Badge,
  Button,
  DataTable,
  type DataTableColumn,
  DataTablePagination,
  FilterPills,
  Input,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

export const metadata = { title: '상품 관리' };

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '판매중' },
  { value: 'DRAFT', label: '임시저장' },
  { value: 'SOLD_OUT', label: '품절' },
  { value: 'HIDDEN', label: '숨김' },
  { value: 'DISCONTINUED', label: '단종' },
] as const;

type AdminProduct = Awaited<ReturnType<typeof adminListProducts>>['data'][number];

interface PageProps {
  searchParams: Promise<{
    status?: string;
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as ProductStatus | 'ALL') ?? 'ALL';
  const categoryId = params.category ?? '';
  const search = params.search ?? '';
  const page = Math.max(1, Number(params.page ?? 1));

  const [result, categories] = await Promise.all([
    adminListProducts({
      status,
      category_id: categoryId || undefined,
      search: search || undefined,
      page,
    }),
    adminListCategories(),
  ]);

  function buildQuery(overrides: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    const merged = {
      status,
      category: categoryId || undefined,
      search: search || undefined,
      page: String(page),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'ALL') q.set(k, v);
    });
    const str = q.toString();
    return str ? `/products?${str}` : '/products';
  }

  const columns: DataTableColumn<AdminProduct>[] = [
    {
      key: 'product',
      header: '상품',
      cell: (p) => (
        <Link href={`/products/${p.id}`} className="group flex items-center gap-3">
          {p.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.thumbnail_url}
              alt={p.name_ko}
              className="h-10 w-10 shrink-0 rounded-md border border-border object-cover"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-md border border-border bg-muted" />
          )}
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-foreground group-hover:text-[var(--mz-accent)] group-hover:underline">
              {p.name_ko}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">{p.slug}</div>
          </div>
        </Link>
      ),
    },
    {
      key: 'category',
      header: '카테고리',
      width: '140px',
      cell: (p) => (
        <span className="text-[12.5px] text-muted-foreground">
          {p.category?.name_ko ?? '—'}
        </span>
      ),
    },
    {
      key: 'price',
      header: '가격 (KRW)',
      align: 'right',
      width: '120px',
      cell: (p) => (
        <span className="font-mono text-[13px] font-medium">
          ₩{p.base_price_krw.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: '상태',
      width: '140px',
      cell: (p) => (
        <div className="flex items-center gap-1.5">
          <Badge variant={PRODUCT_STATUS_VARIANT[p.status]}>
            {PRODUCT_STATUS_LABEL[p.status]}
          </Badge>
          {p.is_featured && <Badge variant="accent">추천</Badge>}
        </div>
      ),
    },
    {
      key: 'created',
      header: '등록일',
      align: 'right',
      width: '110px',
      cell: (p) => (
        <span className="text-[12.5px] text-muted-foreground">
          {new Date(p.created_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="상품 관리"
        description={`총 ${result.total.toLocaleString()}건`}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/products/categories">
                <FolderTree className="mr-1.5 h-4 w-4" />
                카테고리 관리
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/products/new">
                <Plus className="mr-1.5 h-4 w-4" />
                상품 등록
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterPills
          pills={STATUS_TABS}
          activeValue={status}
          buildHref={(v) => buildQuery({ status: v, page: '1' })}
        />
        <form method="GET" action="/products" className="ml-auto flex gap-2">
          <input type="hidden" name="status" value={status} />
          <Select name="category" defaultValue={categoryId || 'ALL'}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="전체 카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 카테고리</SelectItem>
              {categories
                .filter((c) => c.parent_id === null)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name_ko}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="상품명 검색"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline" size="md">
            검색
          </Button>
          {(search || categoryId) && (
            <Button type="button" variant="ghost" size="md" asChild>
              <Link href={buildQuery({ search: undefined, category: undefined, page: '1' })}>
                초기화
              </Link>
            </Button>
          )}
        </form>
      </div>

      <DataTable<AdminProduct>
        columns={columns}
        rows={result.data}
        rowKey={(p) => p.id}
        empty="조건에 맞는 상품이 없습니다. 새 상품을 등록해보세요."
        footer={
          <DataTablePagination
            page={page}
            total={result.total}
            perPage={result.per_page}
            displayed={result.data.length}
            unit="건"
            buildHref={(p) => buildQuery({ page: String(p) })}
          />
        }
      />
    </div>
  );
}
