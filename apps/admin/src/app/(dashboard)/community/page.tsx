import Link from 'next/link';
import type { BoardType, PostStatus } from '@commerce/types';
import { adminListPosts } from '@/lib/queries/community';
import {
  PageHeader,
  StatusTabs,
  SearchBar,
  SectionCard,
  Pagination,
  Badge,
} from '@/components/ui';

// ─── Labels & badge variants ───────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'accent';

const POST_STATUS_LABEL: Record<PostStatus, string> = {
  ACTIVE: '노출',
  HIDDEN: '숨김',
  DELETED: '삭제',
};

const POST_STATUS_VARIANT: Record<PostStatus, BadgeVariant> = {
  ACTIVE: 'success',
  HIDDEN: 'warning',
  DELETED: 'danger',
};

const BOARD_TYPE_LABEL: Record<BoardType, string> = {
  DAILY: '일상',
  STYLE: '스타일',
  TIP: '팁',
  QUESTION: '질문',
};

const STATUS_TABS: Array<{ value: PostStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '노출' },
  { value: 'HIDDEN', label: '숨김' },
  { value: 'DELETED', label: '삭제' },
];

const BOARD_TABS: Array<{ value: BoardType | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'DAILY', label: '일상' },
  { value: 'STYLE', label: '스타일' },
  { value: 'TIP', label: '팁' },
  { value: 'QUESTION', label: '질문' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

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
  const isPinned = params.pinned === '1' ? true : undefined;
  const search = params.search ?? '';
  const page = Number(params.page ?? 1);

  const result = await adminListPosts({
    status,
    boardType,
    isPinned,
    search: search || undefined,
    page,
  });

  function buildQuery(overrides: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      status,
      board: boardType,
      pinned: params.pinned,
      search: search || undefined,
      page: String(page),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined) q.set(k, v);
    });
    return '?' + q.toString();
  }

  return (
    <div>
      <PageHeader title="커뮤니티 관리" />

      {/* Filters row */}
      <div className="flex flex-wrap items-start gap-3 mb-6">
        <StatusTabs
          tabs={STATUS_TABS}
          current={status}
          buildHref={(value) => `/community${buildQuery({ status: value, page: '1' })}`}
        />
        <StatusTabs
          tabs={BOARD_TABS}
          current={boardType}
          buildHref={(value) => `/community${buildQuery({ board: value, page: '1' })}`}
        />
        <Link
          href={`/community${buildQuery({ pinned: isPinned ? undefined : '1', page: '1' })}`}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            isPinned
              ? 'border-[var(--color-info)] bg-[var(--color-info-surface)] text-[var(--color-info)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]'
          }`}
        >
          상단 고정
        </Link>
        <SearchBar
          defaultValue={search}
          placeholder="제목 검색"
          hiddenFields={[
            { name: 'status', value: status },
            { name: 'board', value: boardType },
          ]}
          resetHref={`/community${buildQuery({ search: undefined, page: '1' })}`}
        />
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">제목</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">게시판</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">작성자</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">좋아요</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">댓글</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">작성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {result.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                    게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                result.data.map((post) => (
                  <tr key={post.id} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                    <td className="px-4 py-3 max-w-[240px]">
                      <div className="flex items-center gap-2">
                        {post.is_pinned && (
                          <span className="text-[var(--color-info)] text-xs font-bold shrink-0">고정</span>
                        )}
                        <Link
                          href={`/community/${post.id}`}
                          className="text-[var(--color-text-primary)] hover:text-[var(--color-link)] truncate"
                        >
                          {post.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{BOARD_TYPE_LABEL[post.board_type]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">
                      {post.user?.name ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={POST_STATUS_VARIANT[post.status]}>
                        {POST_STATUS_LABEL[post.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                      {post.like_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                      {post.comment_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Pagination
        page={page}
        total={result.total}
        perPage={result.per_page}
        hasNext={result.has_next}
        buildHref={(p) => `/community${buildQuery({ page: String(p) })}`}
      />
    </div>
  );
}
