import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Heart, MessageSquare } from 'lucide-react';
import type { PostStatus, UserStatus } from '@commerce/types';
import {
  adminGetPost,
  BOARD_TYPE_LABEL,
  POST_STATUS_LABEL,
  POST_STATUS_VARIANT,
} from '@/lib/queries/community';
import { MEMBER_STATUS_LABEL, MEMBER_STATUS_VARIANT } from '@/lib/queries/members';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  InfoRow,
  InfoSection,
  PageHeader,
} from '@/components/ui';
import { PostActions } from './_components/PostActions';
import { CommentRow } from './_components/CommentRow';

export const metadata = { title: '게시글 상세' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CommunityPostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await adminGetPost(id);
  if (!post) notFound();

  const authorStatus: UserStatus =
    (post.user as (typeof post.user & { status?: UserStatus }) | null)?.status ?? 'ACTIVE';

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/community">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> 커뮤니티 목록
          </Link>
        </Button>
      </div>

      <PageHeader
        title={post.title}
        description={
          <span className="inline-flex items-center gap-2">
            <Badge variant="outline">{BOARD_TYPE_LABEL[post.board_type]}</Badge>
            <span className="text-muted-foreground">{post.user?.name ?? '—'}</span>
            <span className="text-muted-foreground">
              · {new Date(post.created_at).toLocaleString('ko-KR')}
            </span>
          </span>
        }
        actions={
          <>
            <Badge variant={POST_STATUS_VARIANT[post.status as PostStatus]}>
              {POST_STATUS_LABEL[post.status as PostStatus]}
            </Badge>
            {post.is_pinned && <Badge variant="accent">상단 고정</Badge>}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          <InfoSection
            title="본문"
            actions={
              <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3 w-3" /> {post.like_count}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> {post.comment_count}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {post.view_count}
                </span>
              </div>
            }
          >
            <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground">
              {post.content}
            </p>

            {post.images && post.images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.images.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img.url}
                    alt={img.alt || `첨부 이미지 ${i + 1}`}
                    className="h-32 w-32 rounded-md border border-border object-cover"
                  />
                ))}
              </div>
            )}

            {post.dog_breed && (
              <p className="mt-3 text-[12px] text-muted-foreground">견종: {post.dog_breed}</p>
            )}
          </InfoSection>

          <InfoSection title={`댓글 · ${post.comments.length}개`}>
            {post.comments.length === 0 ? (
              <p className="py-2 text-center text-[13px] text-muted-foreground">
                댓글이 없습니다.
              </p>
            ) : (
              <div className="-mx-2 divide-y divide-border">
                {post.comments.map((comment) => (
                  <CommentRow key={comment.id} comment={comment} postId={post.id} />
                ))}
              </div>
            )}
          </InfoSection>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <InfoSection title="게시글 관리">
            <PostActions
              postId={post.id}
              currentStatus={post.status as PostStatus}
              isPinned={post.is_pinned}
              authorId={post.user_id}
              authorStatus={authorStatus}
            />
          </InfoSection>

          {post.user && (
            <InfoSection title="작성자">
              <div className="mb-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{post.user.name?.[0] ?? '?'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground">{post.user.name}</p>
                  <Badge variant={MEMBER_STATUS_VARIANT[authorStatus]}>
                    {MEMBER_STATUS_LABEL[authorStatus]}
                  </Badge>
                </div>
              </div>
              <Link
                href={`/members/${post.user_id}`}
                className="text-[12px] text-[var(--mz-accent)] hover:underline"
              >
                회원 상세 →
              </Link>
            </InfoSection>
          )}

          <InfoSection title="메타">
            <dl>
              <InfoRow label="게시판">{BOARD_TYPE_LABEL[post.board_type]}</InfoRow>
              <InfoRow label="좋아요">
                <span className="font-mono">{post.like_count.toLocaleString()}</span>
              </InfoRow>
              <InfoRow label="조회수">
                <span className="font-mono">{post.view_count.toLocaleString()}</span>
              </InfoRow>
              <InfoRow label="작성">
                <span className="text-[12px]">
                  {new Date(post.created_at).toLocaleString('ko-KR')}
                </span>
              </InfoRow>
              <InfoRow label="수정">
                <span className="text-[12px]">
                  {new Date(post.updated_at).toLocaleString('ko-KR')}
                </span>
              </InfoRow>
            </dl>
          </InfoSection>
        </div>
      </div>
    </div>
  );
}
