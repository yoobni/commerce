'use client';

import { useTransition } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import type { PostStatus } from '@commerce/types';
import { Avatar, AvatarFallback, Badge, toast } from '@/components/ui';
import { POST_STATUS_LABEL, POST_STATUS_VARIANT } from '@/lib/queries/community';
import type { AdminCommentRow } from '@/lib/queries/community';
import { setCommentStatus } from '@/lib/actions/community';
import { cn } from '@/lib/cn';

interface Props {
  comment: AdminCommentRow;
  postId: string;
}

export function CommentRow({ comment, postId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleStatus(status: PostStatus, label: string) {
    startTransition(async () => {
      try {
        await setCommentStatus(comment.id, postId, status);
        toast.success(`댓글을 ${label} 처리했습니다.`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '상태 변경 실패');
      }
    });
  }

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3',
        comment.parent_id && 'ml-8 border-l-2 border-border pl-4',
        comment.status !== 'ACTIVE' && 'opacity-60',
      )}
    >
      <Avatar className="mt-0.5 h-8 w-8">
        <AvatarFallback>{comment.user?.name?.[0] ?? '?'}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground">
            {comment.user?.name ?? '—'}
          </span>
          <Badge variant={POST_STATUS_VARIANT[comment.status as PostStatus]}>
            {POST_STATUS_LABEL[comment.status as PostStatus]}
          </Badge>
          {comment.parent_id && (
            <Badge variant="muted" className="text-[10px]">
              답글
            </Badge>
          )}
          <span className="ml-auto text-[11px] text-muted-foreground">
            {new Date(comment.created_at).toLocaleString('ko-KR')}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-[13px] text-foreground">{comment.content}</p>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        {comment.status === 'ACTIVE' && (
          <button
            type="button"
            onClick={() => handleStatus('HIDDEN', '숨김')}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded border border-input bg-card px-2 py-1 text-[11px] text-foreground hover:bg-secondary disabled:opacity-60"
          >
            <EyeOff className="h-3 w-3" /> 숨김
          </button>
        )}
        {comment.status === 'HIDDEN' && (
          <button
            type="button"
            onClick={() => handleStatus('ACTIVE', '복구')}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded border border-input bg-card px-2 py-1 text-[11px] text-foreground hover:bg-secondary disabled:opacity-60"
          >
            <Eye className="h-3 w-3" /> 복구
          </button>
        )}
        {comment.status !== 'DELETED' && (
          <button
            type="button"
            onClick={() => handleStatus('DELETED', '삭제')}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded border border-destructive/30 bg-card px-2 py-1 text-[11px] text-destructive hover:bg-destructive/10 disabled:opacity-60"
          >
            <Trash2 className="h-3 w-3" /> 삭제
          </button>
        )}
      </div>
    </div>
  );
}
