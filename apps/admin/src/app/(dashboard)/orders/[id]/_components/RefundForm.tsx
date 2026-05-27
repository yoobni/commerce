'use client';

import { useState, useTransition } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
} from '@/components/ui';
import { processRefund } from '@/lib/actions/orders';

interface RefundFormProps {
  orderId: string;
  maxRefundable: number;
  currency: string;
}

export function RefundForm({ orderId, maxRefundable, currency }: RefundFormProps) {
  const [amount, setAmount] = useState(String(maxRefundable));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('유효한 금액을 입력하세요.');
      return;
    }
    if (parsed > maxRefundable) {
      setError(`최대 환불 가능 금액: ${maxRefundable.toLocaleString()} ${currency}`);
      return;
    }
    setConfirmOpen(true);
  };

  const confirmRefund = () => {
    const parsed = Number(amount);
    startTransition(async () => {
      try {
        await processRefund(orderId, parsed);
        toast.success(`${parsed.toLocaleString()} ${currency} 환불 처리 완료`);
        setConfirmOpen(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '환불 처리 중 오류가 발생했습니다.';
        setError(msg);
        toast.error(msg);
        setConfirmOpen(false);
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="refund-amount">환불 금액 ({currency})</Label>
          <div className="flex gap-2">
            <Input
              id="refund-amount"
              type="number"
              min={1}
              max={maxRefundable}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
              className="flex-1"
            />
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? '처리 중…' : '환불 처리'}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            최대 환불 가능: {maxRefundable.toLocaleString()} {currency}
          </p>
        </div>
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      <Dialog open={confirmOpen} onOpenChange={(open) => !isPending && setConfirmOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>환불 확정</DialogTitle>
            <DialogDescription>
              <strong className="text-foreground">{Number(amount).toLocaleString()} {currency}</strong>를 환불
              처리합니다. 결제 게이트웨이로 즉시 요청이 전송되며, 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isPending}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmRefund} disabled={isPending}>
              {isPending ? '처리 중…' : '환불 확정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
