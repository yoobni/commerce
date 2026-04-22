import Link from 'next/link';
import type { BoardType, PostStatus } from '@commerce/types';
import { adminListPosts } from '@/lib/queries/community';

// ─── Labels & badges ──────────────────────────────────────────────────────────

const POST_STATUS_LABEL: Record<PostStatus, string> = {
  ACTIVE: '노출',
  HIDDEN: '숨김',
  DELETED: '삭제',
};

const POST_STATUS_BADGE: Record<PostStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  HIDDEN: 'bg-orange-100 text-orange-700',
  DELETED: 'bg-red-100 text-red-700',
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
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">커뮤니티 관리</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/community${buildQuery({ status: tab.value, page: '1' })}`}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                status === tab.value
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Board type tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {BOARD_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/community${buildQuery({ board: tab.value, page: '1' })}`}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                boardType === tab.value
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Pinned filter */}
        <Link
          href={`/community${buildQuery({ pinned: isPinned ? undefined : '1', page: '1' })}`}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            isPinned
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50'
          }`}
        >
          상단 고정
        </Link>

        {/* Search */}
        <form method="GET" className="flex gap-2 ml-auto">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="제목 검색"
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="board" value={boardType} />
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90"
          >
            검색
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                제목
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                게시판
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                작성자
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                상태
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                좋아요
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                댓글
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                작성일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {result.data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-[var(--color-text-tertiary)]"
                >
                  게시글이 없습니다.
                </td>
              </tr>
            ) : (
              result.data.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 max-w-[240px]">
                    <div className="flex items-center gap-2">
                      {post.is_pinned && (
                        <span className="text-indigo-500 text-xs font-bold">📌</span>
                      )}
                      <Link
                        href={`/community/${post.id}`}
                        className="text-[var(--color-text-primary)] hover:text-blue-600 truncate"
                      >
                        {post.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {BOARD_TYPE_LABEL[post.board_type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-primary)]">
                    {post.user?.name ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${POST_STATUS_BADGE[post.status]}`}
                    >
                      {POST_STATUS_LABEL[post.status]}
                    </span>
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

      {/* Pagination */}
      {result.total > result.per_page && (
        <div className="flex items-center justify-between mt-4 text-sm text-[var(--color-text-secondary)]">
          <span>
            총 {result.total.toLocaleString()}건 · {page}페이지
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/community${buildQuery({ page: String(page - 1) })}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                이전
              </Link>
            )}
            {result.has_next && (
              <Link
                href={`/community${buildQuery({ page: String(page + 1) })}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                다음
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
