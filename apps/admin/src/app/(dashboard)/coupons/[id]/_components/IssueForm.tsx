'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button, Input, Label, toast } from '@/components/ui';
import { issueCouponToUserByEmail } from '@/lib/actions/coupons';

interface Props {
  couponId: string;
}

export function IssueForm({ couponId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [email]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await issueCouponToUserByEmail(couponId, email.trim());
        toast.success(`쿠폰을 ${email.trim()}에 발급했습니다.`);
        setEmail('');
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : '발급 실패';
        setError(msg);
        toast.error(msg);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="issue-email">회원 이메일</Label>
        <Input
          id="issue-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          required
          disabled={isPending}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-1.5 text-[11.5px] text-destructive"
        >
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={isPending || !email} className="w-full" size="md">
        {isPending ? '발급 중…' : '발급'}
      </Button>
    </form>
  );
}
