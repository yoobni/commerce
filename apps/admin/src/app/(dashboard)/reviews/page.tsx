import Link from 'next/link';
import { Camera, Sparkles, AlertTriangle } from 'lucide-react';
import type { ReviewStatus } from '@commerce/types';
import {
  adminListReviews,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_VARIANT,
} from '@/lib/queries/reviews';
import {
  Badge,
  DataTable,
  type DataTableColumn,
  DataTablePagination,
  FilterPills,
  PageHeader,
} from '@/components/ui';
import { cn } from '@/lib/cn';

export const metadata = { title: '리뷰 관리' };

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '노출' },
  { value: 'HIDDEN', label: '숨김' },
  { value: 'DELETED', label: '삭제' },
] as const;

type AdminReview = Awaited<ReturnType<typeof adminListReviews>>['data'][number];

interface PageProps {
  searchParams: Promise<{
    status?: string;
    best?: string;
    photo?: string;
    rating?: string;
    page?: string;
  }>;
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as ReviewStatus | 'ALL') ?? 'ALL';
  const isBest = params.best === '1' ? true : params.best === '0' ? false : undefined;
  const isPhoto = params.photo === '1' ? true : params.photo === '0' ? false : undefined;
  const minRating = params.rating ? Number(params.rating) : undefined;
  const page = Math.max(1, Number(params.page ?? 1));

  const result = await adminListReviews({ status, isBest, isPhoto, minRating, page });

  function buildQuery(overrides: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    const merged = {
      status,
      best: params.best,
      photo: params.photo,
      rating: params.rating,
      page: String(page),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'ALL') q.set(k, v);
    });
    const str = q.toString();
    return str ? `/reviews?${str}` : '/reviews';
  }

  const columns: DataTableColumn<AdminReview>[] = [
    {
      key: 'product',
      header: '상품',
      width: '180px',
      cell: (r) =>
        r.product ? (
          <div className="flex items-center gap-2">
            {r.product.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.product.thumbnail_url}
                alt={r.product.name_ko}
                className="h-8 w-8 shrink-0 rounded border border-border object-cover"
              />
            ) : (
              <div className="h-8 w-8 shrink-0 rounded border border-border bg-muted" />
            )}
            <span className="truncate text-[13px] text-foreground">{r.product.name_ko}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'user',
      header: '작성자',
      width: '100px',
      cell: (r) => <span className="text-[13px] text-foreground">{r.user?.name ?? '—'}</span>,
    },
    {
      key: 'rating',
      header: '평점',
      align: 'center',
      width: '110px',
      cell: (r) => (
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-[13px] font-semibold',
            r.rating <= 2
              ? 'text-destructive'
              : r.rating === 3
                ? 'text-[#92400e]'
                : 'text-[#b3801a]',
          )}
        >
          {'★'.repeat(r.rating)}
          <span className="text-muted-foreground">{'★'.repeat(5 - r.rating)}</span>
        </span>
      ),
    },
    {
      key: 'content',
      header: '내용 요약',
      cell: (r) => (
        <Link
          href={`/reviews/${r.id}`}
          className="line-clamp-2 text-[12.5px] text-muted-foreground hover:text-foreground"
        >
          {r.content}
        </Link>
      ),
    },
    {
      key: 'status',
      header: '상태',
      width: '110px',
      cell: (r) => (
        <div className="flex flex-col gap-1">
          <Badge variant={REVIEW_STATUS_VARIANT[r.status]}>
            {REVIEW_STATUS_LABEL[r.status]}
          </Badge>
          {r.is_best && (
            <Badge variant="warning" className="w-fit">
              베스트
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: '작성일',
      align: 'right',
      width: '110px',
      cell: (r) => (
        <span className="text-[12px] text-muted-foreground">
          {new Date(r.created_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
  ];

  const quickFilters = [
    {
      key: 'best',
      label: '베스트',
      icon: Sparkles,
      active: isBest === true,
      href: buildQuery({ best: isBest === true ? undefined : '1', page: '1' }),
    },
    {
      key: 'photo',
      label: '포토리뷰',
      icon: Camera,
      active: isPhoto === true,
      href: buildQuery({ photo: isPhoto === true ? undefined : '1', page: '1' }),
    },
    {
      key: 'rating1',
      label: '1점',
      icon: AlertTriangle,
      active: minRating === 1,
      href: buildQuery({ rating: minRating === 1 ? undefined : '1', page: '1' }),
    },
  ];

  return (
    <div>
      <PageHeader title="리뷰 관리" description={`총 ${result.total.toLocaleString()}건`} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterPills
          pills={STATUS_TABS}
          activeValue={status}
          buildHref={(v) => buildQuery({ status: v, page: '1' })}
        />
        <div className="ml-auto flex flex-wrap gap-2">
          {quickFilters.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.key}
                href={f.href}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                  f.active
                    ? 'border-[var(--mz-accent)] bg-accent text-accent-foreground'
                    : 'border-input bg-card text-foreground hover:bg-secondary',
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      <DataTable<AdminReview>
        columns={columns}
        rows={result.data}
        rowKey={(r) => r.id}
        empty="조건에 맞는 리뷰가 없습니다."
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
