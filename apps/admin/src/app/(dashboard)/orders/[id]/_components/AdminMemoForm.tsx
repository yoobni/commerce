'use client';

import { useTransition, useRef, useState } from 'react';
import { Button, Textarea, toast } from '@/components/ui';
import { updateOrderAdminMemo } from '@/lib/actions/orders';

interface AdminMemoFormProps {
  orderId: string;
  initialMemo: string | null;
}

export function AdminMemoForm({ orderId, initialMemo }: AdminMemoFormProps) {
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [dirty, setDirty] = useState(false);

  const handleSave = () => {
    const memo = ref.current?.value ?? '';
    startTransition(async () => {
      try {
        await updateOrderAdminMemo(orderId, memo);
        toast.success('메모가 저장되었습니다.');
        setDirty(false);
      } catch {
        toast.error('저장에 실패했습니다.');
      }
    });
  };

  return (
    <div className="space-y-2">
      <Textarea
        id="admin-memo"
        ref={ref}
        defaultValue={initialMemo ?? ''}
        rows={3}
        placeholder="내부용 메모를 입력하세요. 고객에게 노출되지 않습니다."
        onChange={() => setDirty(true)}
      />
      <Button onClick={handleSave} disabled={isPending || !dirty} size="sm">
        {isPending ? '저장 중…' : '메모 저장'}
      </Button>
    </div>
  );
}
