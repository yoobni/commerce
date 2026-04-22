import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { BoardType, PostStatus, UserStatus } from '@commerce/types';
import { adminGetPost } from '@/lib/queries/community';
import { PostActions } from './_components/PostActions';
import { CommentRow } from './_components/CommentRow';

// ─── Labels ───────────────────────────────────────────────────────────────────

const BOARD_TYPE_LABEL: Record<BoardType, string> = {
  DAILY: '일상',
  STYLE: '스타일',
  TIP: '팁',
  QUESTION: '질문',
};

const POST_STATUS_BADGE: Record<PostStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  HIDDEN: 'bg-orange-100 text-orange-700',
  DELETED: 'bg-red-100 text-red-700',
};

const POST_STATUS_LABEL: Record<PostStatus, string> = {
  ACTIVE: '노출',
  HIDDEN: '숨김',
  DELETED: '삭제',
};

const USER_STATUS_BADGE: Record<UserStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

const USER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: '활성',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CommunityPostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await adminGetPost(id);
  if (!post) notFound();

  // Fetch author status for sanction UI — user field has limited fields; fallback to ACTIVE
  const authorStatus: UserStatus = (post.user as (typeof post.user & { status?: UserStatus }) | null)
    ?.status ?? 'ACTIVE';

  return (
    <div className="max-w-5xl">
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        ← 커뮤니티 목록
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
          {BOARD_TYPE_LABEL[post.board_type]}
        </span>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">{post.title}</h1>
        <span
          className={`px-2.5 py-1 rounded-full text-sm font-medium ${POST_STATUS_BADGE[post.status]}`}
        >
          {POST_STATUS_LABEL[post.status]}
        </span>
        {post.is_pinned && (
          <span className="px-2.5 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
            상단 고정
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Main ── */}
        <div className="col-span-2 space-y-6">
          {/* Post content */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                  {post.user?.name?.[0] ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {post.user?.name ?? '-'}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {new Date(post.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex gap-3 text-xs text-[var(--color-text-tertiary)]">
                <span>좋아요 {post.like_count}</span>
                <span>댓글 {post.comment_count}</span>
                <span>조회 {post.view_count}</span>
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>

            {post.images && post.images.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {post.images.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`첨부 이미지 ${i + 1}`}
                    className="w-32 h-32 object-cover rounded-lg border border-[var(--color-border)]"
                  />
                ))}
              </div>
            )}

            {post.dog_breed && (
              <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
                견종: {post.dog_breed}
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="font-medium text-[var(--color-text-primary)]">
                댓글 ({post.comments.length}개)
              </h2>
            </div>
            {post.comments.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                댓글이 없습니다.
              </p>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {post.comments.map((comment) => (
                  <CommentRow key={comment.id} comment={comment} postId={post.id} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="col-span-1 space-y-4">
          {/* Post actions */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="font-medium text-[var(--color-text-primary)] mb-4">게시글 관리</h2>
            <PostActions
              postId={post.id}
              currentStatus={post.status}
              isPinned={post.is_pinned}
              authorId={post.user_id}
              authorStatus={authorStatus}
            />
          </div>

          {/* Author */}
          {post.user && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="font-medium text-[var(--color-text-primary)] mb-3">작성자</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-500">
                  {post.user.name?.[0] ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {post.user.name}
                  </p>
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${USER_STATUS_BADGE[authorStatus]}`}
                  >
                    {USER_STATUS_LABEL[authorStatus]}
                  </span>
                </div>
              </div>
              <Link
                href={`/members/${post.user_id}`}
                className="text-xs text-blue-500 hover:underline"
              >
                회원 상세 →
              </Link>
            </div>
          )}

          {/* Meta */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="font-medium text-[var(--color-text-primary)] mb-3">메타</h2>
            <dl className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              <div className="flex justify-between">
                <dt>게시판</dt>
                <dd>{BOARD_TYPE_LABEL[post.board_type]}</dd>
              </div>
              <div className="flex justify-between">
                <dt>좋아요</dt>
                <dd>{post.like_count.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt>조회수</dt>
                <dd>{post.view_count.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt>작성</dt>
                <dd>{new Date(post.created_at).toLocaleString('ko-KR')}</dd>
              </div>
              <div className="flex justify-between">
                <dt>수정</dt>
                <dd>{new Date(post.updated_at).toLocaleString('ko-KR')}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
