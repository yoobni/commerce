import Link from 'next/link';
import { Pin, Search } from 'lucide-react';
import type { BoardType, PostStatus } from '@commerce/types';
import {
  adminListPosts,
  BOARD_TYPE_LABEL,
  POST_STATUS_LABEL,
  POST_STATUS_VARIANT,
} from '@/lib/queries/community';
import {
  Badge,
  Button,
  DataTable,
  type DataTableColumn,
  DataTablePagination,
  FilterPills,
  Input,
  PageHeader,
} from '@/components/ui';
import { cn } from '@/lib/cn';

export const metadata = { title: '커뮤니티 관리' };

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '노출' },
  { value: 'HIDDEN', label: '숨김' },
  { value: 'DELETED', label: '삭제' },
] as const;

const BOARD_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'DAILY', label: '일상' },
  { value: 'STYLE', label: '스타일' },
  { value: 'TIP', label: '팁' },
  { value: 'QUESTION', label: '질문' },
] as const;

type AdminPost = Awaited<ReturnType<typeof adminListPosts>>['data'][number];

interface PageProps {
  searchParams: Promise<{
    status?: string;
    board?: string;
    pinned?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as PostStatus | 'ALL') ?? 'ALL';
  const boardType = (params.board as BoardType | 'ALL') ?? 'ALL';
  const isPinned = params.pinned === '1';
  const search = params.search ?? '';
  const page = Math.max(1, Number(params.page ?? 1));

  const result = await adminListPosts({
    status,
    boardType,
    isPinned: isPinned ? true : undefined,
    search: search || undefined,
    page,
  });

  function buildQuery(overrides: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      status,
      board: boardType,
      pinned: isPinned ? '1' : undefined,
      search: search || undefined,
      page: String(page),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'ALL') q.set(k, v);
    });
    const str = q.toString();
    return str ? `/community?${str}` : '/community';
  }

  const columns: DataTableColumn<AdminPost>[] = [
    {
      key: 'title',
      header: '제목',
      cell: (p) => (
        <div className="flex items-center gap-1.5">
          {p.is_pinned && (
            <Pin
              className="h-3.5 w-3.5 shrink-0 text-[var(--mz-accent)]"
              strokeWidth={2}
              aria-label="상단 고정"
            />
          )}
          <Link
            href={`/community/${p.id}`}
            className="line-clamp-1 text-[13px] text-foreground hover:text-[var(--mz-accent)] hover:underline"
          >
            {p.title}
          </Link>
        </div>
      ),
    },
    {
      key: 'board',
      header: '게시판',
      width: '90px',
      cell: (p) => <Badge variant="outline">{BOARD_TYPE_LABEL[p.board_type]}</Badge>,
    },
    {
      key: 'user',
      header: '작성자',
      width: '100px',
      cell: (p) => <span className="text-[13px] text-foreground">{p.user?.name ?? '—'}</span>,
    },
    {
      key: 'status',
      header: '상태',
      width: '80px',
      cell: (p) => (
        <Badge variant={POST_STATUS_VARIANT[p.status]}>{POST_STATUS_LABEL[p.status]}</Badge>
      ),
    },
    {
      key: 'likes',
      header: '좋아요',
      align: 'center',
      width: '70px',
      cell: (p) => (
        <span className="font-mono text-[12.5px] text-muted-foreground">
          {p.like_count.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'comments',
      header: '댓글',
      align: 'center',
      width: '70px',
      cell: (p) => (
        <span className="font-mono text-[12.5px] text-muted-foreground">
          {p.comment_count.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'date',
      header: '작성일',
      align: 'right',
      width: '110px',
      cell: (p) => (
        <span className="text-[12px] text-muted-foreground">
          {new Date(p.created_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="커뮤니티 관리" description={`총 ${result.total.toLocaleString()}건`} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterPills
          pills={STATUS_TABS}
          activeValue={status}
          buildHref={(v) => buildQuery({ status: v, page: '1' })}
        />
        <FilterPills
          pills={BOARD_TABS}
          activeValue={boardType}
          buildHref={(v) => buildQuery({ board: v, page: '1' })}
        />
        <Link
          href={buildQuery({ pinned: isPinned ? undefined : '1', page: '1' })}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition-colors',
            isPinned
              ? 'border-[var(--mz-accent)] bg-accent text-accent-foreground'
              : 'border-input bg-card text-foreground hover:bg-secondary',
          )}
        >
          <Pin className="h-3.5 w-3.5" strokeWidth={1.75} />
          상단 고정
        </Link>

        <form method="GET" action="/community" className="ml-auto flex gap-2">
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="board" value={boardType} />
          {isPinned && <input type="hidden" name="pinned" value="1" />}
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="제목 검색"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline" size="md">
            검색
          </Button>
          {search && (
            <Button type="button" variant="ghost" size="md" asChild>
              <Link href={buildQuery({ search: undefined, page: '1' })}>초기화</Link>
            </Button>
          )}
        </form>
      </div>

      <DataTable<AdminPost>
        columns={columns}
        rows={result.data}
        rowKey={(p) => p.id}
        empty="조건에 맞는 게시글이 없습니다."
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
