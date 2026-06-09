'use client';

import { useState, useTransition } from 'react';
import { cancelOrder } from '@/lib/api/orders-client';
import { Button } from '@/components/ui/Button';

interface CancelOrderButtonProps {
  orderId: string;
  label: string;
}

export function CancelOrderButton({ orderId, label }: CancelOrderButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await cancelOrder(orderId);
        setShowConfirm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '취소에 실패했습니다.');
      }
    });
  }

  if (!showConfirm) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setShowConfirm(true)}>
        {label}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[var(--color-text-secondary)]">정말 취소하시겠습니까?</p>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={handleConfirm} loading={isPending}>
          확인
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
        >
          닫기
        </Button>
      </div>
    </div>
  );
}
