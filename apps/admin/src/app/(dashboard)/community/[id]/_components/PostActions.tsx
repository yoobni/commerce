'use client';

import { useTransition } from 'react';
import { Eye, EyeOff, Pin, PinOff, Trash2, UserX, UserCheck } from 'lucide-react';
import type { PostStatus, UserStatus } from '@commerce/types';
import { Button, toast } from '@/components/ui';
import { setPostStatus, setPostPinned, setUserStatus } from '@/lib/actions/community';

interface Props {
  postId: string;
  currentStatus: PostStatus;
  isPinned: boolean;
  authorId: string;
  authorStatus: UserStatus;
}

export function PostActions({
  postId,
  currentStatus,
  isPinned,
  authorId,
  authorStatus,
}: Props) {
  const [pending, startTransition] = useTransition();

  function handlePostStatus(status: PostStatus, label: string) {
    startTransition(async () => {
      try {
        await setPostStatus(postId, status);
        toast.success(`게시글을 ${label} 처리했습니다.`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '상태 변경 실패');
      }
    });
  }

  function handlePin() {
    startTransition(async () => {
      try {
        await setPostPinned(postId, !isPinned);
        toast.success(isPinned ? '상단 고정을 해제했습니다.' : '상단에 고정했습니다.');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '고정 토글 실패');
      }
    });
  }

  function handleUserStatus(status: UserStatus, label: string) {
    startTransition(async () => {
      try {
        await setUserStatus(authorId, status, postId);
        toast.success(`회원을 ${label} 처리했습니다.`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '회원 상태 변경 실패');
      }
    });
  }

  return (
    <div className="space-y-2">
      {currentStatus === 'ACTIVE' && (
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={() => handlePostStatus('HIDDEN', '숨김')}
          disabled={pending}
        >
          <EyeOff className="mr-1.5 h-4 w-4" /> 게시글 숨김
        </Button>
      )}
      {currentStatus === 'HIDDEN' && (
        <Button
          variant="accent"
          size="md"
          className="w-full"
          onClick={() => handlePostStatus('ACTIVE', '복구')}
          disabled={pending}
        >
          <Eye className="mr-1.5 h-4 w-4" /> 게시글 복구
        </Button>
      )}
      {currentStatus !== 'DELETED' && (
        <Button
          variant="destructive"
          size="md"
          className="w-full"
          onClick={() => handlePostStatus('DELETED', '삭제')}
          disabled={pending}
        >
          <Trash2 className="mr-1.5 h-4 w-4" /> 게시글 삭제
        </Button>
      )}

      <Button
        variant={isPinned ? 'accent' : 'outline'}
        size="md"
        className="w-full"
        onClick={handlePin}
        disabled={pending}
      >
        {isPinned ? (
          <>
            <PinOff className="mr-1.5 h-4 w-4" /> 상단 고정 해제
          </>
        ) : (
          <>
            <Pin className="mr-1.5 h-4 w-4" /> 상단 고정
          </>
        )}
      </Button>

      <div className="space-y-2 border-t border-border pt-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          작성자 제재
        </p>
        {authorStatus === 'ACTIVE' && (
          <Button
            variant="destructive"
            size="md"
            className="w-full"
            onClick={() => handleUserStatus('SUSPENDED', '정지')}
            disabled={pending}
          >
            <UserX className="mr-1.5 h-4 w-4" /> 회원 정지
          </Button>
        )}
        {authorStatus === 'SUSPENDED' && (
          <Button
            variant="accent"
            size="md"
            className="w-full"
            onClick={() => handleUserStatus('ACTIVE', '정지 해제')}
            disabled={pending}
          >
            <UserCheck className="mr-1.5 h-4 w-4" /> 회원 정지 해제
          </Button>
        )}
        {authorStatus === 'WITHDRAWN' && (
          <p className="text-[12px] text-muted-foreground">탈퇴 회원</p>
        )}
      </div>
    </div>
  );
}
